import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel2Quiz, toggleFavorite } from '../api';
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델 추가
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import './GameLevel2.css';
import Webcam from 'react-webcam'; // Webcam 컴포넌트 추가
import Modal from 'react-modal';

Modal.setAppElement('#root');

// 팝업 모달 컴포넌트
function PopupModal({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 일정 시간 후 자동으로 모달 닫기
    }, 2000); // 2초 후 자동으로 닫힘
    return () => clearTimeout(timer); // 컴포넌트가 언마운트되면 타이머 클리어
  }, [onClose]);

  return (
    <div className="popup-modal">
      <div className="modal-content">
        <span>{message}</span>
      </div>
    </div>
  );
}

function GameLevel2() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [score, setScore] = useState(0); // 점수
  const [questionCount, setQuestionCount] = useState(0); // 문제 개수
  const [options, setOptions] = useState([]); // 보기
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // 캔버스 추가

  // Mediapipe Handpose 모델 초기화 함수
  const initializeHandpose = useCallback(async () => {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      const net = await handpose.load();

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video);
          if (predictions.length > 0) {
            drawHands(predictions); // 손 관절 시각화
            const result = await sendToMLServer(predictions[0].landmarks);
            if (result > 0) {
              setPopupMessage('정답입니다!');
              setScore(score + 1); // 정답 시 점수 증가
            } else {
              setPopupMessage('오답입니다!');
            }
            setShowPopup(true); // 팝업 표시
          }
        }
      };
      detect();
    } catch (error) {
      console.error('Handpose 모델 초기화 중 오류 발생:', error);
    }
  }, [score]);

  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    predictions.forEach((prediction) => {
      prediction.landmarks.forEach((landmark) => {
        const { x, y } = landmark;
        ctx.beginPath();
        ctx.arc(x * videoWidth, y * videoHeight, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    });
  };

  const sendToMLServer = async (landmarks) => {
    try {
      const response = await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: currentQuestion?.quiz_id, landmarks }),
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('ML 서버와의 통신 오류가 발생했습니다.', error);
      return 0;
    }
  };

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const randomQuizId = Math.floor(Math.random() * 41) + 100;
        const response = await fetchLevel2Quiz(randomQuizId);
        if (response) {
          setCurrentQuestion(response);
          setIsFavorite(response.isStarred);
          setOptions(response.options); // 보기 항목 설정
        }
      } catch (error) {
        console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    loadQuizData(); // 컴포넌트가 마운트될 때 퀴즈 데이터 로드
    initializeHandpose(); // Handpose 모델 초기화
  }, [initializeHandpose]);

  const handleOptionClick = (option) => {
    if (option === currentQuestion.correctAnswer) {
      setIsCorrect(true);
      setScore(score + 1);
    } else {
      setIsCorrect(false);
    }
    setQuestionCount(questionCount + 1);
    setModalIsOpen(true); // 모달 열기
  };

  const handleFavoriteClick = async () => {
    try {
      const response = await toggleFavorite(currentQuestion?.quiz_id);
      if (response.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류 발생:', error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    if (questionCount >= 10) {
      navigate('/'); // 10문제를 완료한 경우 홈으로 이동
    } else {
      const randomQuizId = Math.floor(Math.random() * 41) + 100; // 다음 퀴즈도 랜덤하게 설정
      setCurrentQuestion(null);
      fetchLevel2Quiz(randomQuizId).then((response) => {
        setCurrentQuestion(response);
      });
    }
  };

  return (
    <Container className="game-level2-container">
      <div className="game-level2-left">
        {currentQuestion ? (
          <>
            <h2>{currentQuestion.content}</h2>
            <img src={currentQuestion.objectUrl} alt="퀴즈 이미지" />
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="game-level2-right">
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="options">
          {options.map((option, index) => (
            <button key={index} className="option-button" onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))}
        </div>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <Webcam ref={webcamRef} className="video-feed" screenshotFormat="image/jpeg" />
          <canvas ref={canvasRef} className="canvas" />
        </div>
      </div>

      {showPopup && <PopupModal message={popupMessage} onClose={handleClosePopup} />}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Result Modal"
        className="result-modal"
        overlayClassName="result-overlay"
      >
        <div className="modal-content">
          <h2 className={isCorrect ? 'correct-icon' : 'wrong-icon'}>
            {isCorrect ? 'O' : 'X'}
          </h2>
          <p>{isCorrect ? '정답입니다!' : '오답입니다!'}</p>
          <button onClick={handleCloseModal} className="next-button">다음</button>
        </div>
      </Modal>
    </Container>
  );
}

export default GameLevel2;
