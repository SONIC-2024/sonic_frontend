import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite } from '../api';
import './GameLevel1.css';
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import '@tensorflow/tfjs-backend-webgl'; // WebGL 백엔드 추가
import '@tensorflow/tfjs-backend-wasm'; // WASM 백엔드 추가

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

function GameLevel1() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [quizId, setQuizId] = useState(null);
  const [mlIds, setMlIds] = useState([]); // ML 서버용 id 배열
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [mlResult, setMlResult] = useState(null);

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // 캔버스 참조 추가

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 30) + 1;
    loadQuizData(randomQuizId);
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      const response = await fetchLevel1Quiz(quizId);
      if (response.success) {
        setCurrentQuestion(response.data);
        setQuizId(response.data.quiz_id);
        setMlIds(response.data.id); // ML 서버용 id 설정
        setIsFavorite(response.data.starred || false);
        setIsLoading(false);
        setCurrentCharacterIndex(0); // 첫 번째 지문자 인식 인덱스 초기화
        initializeHandpose(); // Handpose 모델 초기화 및 손 관절 인식 시작
        console.log('퀴즈 데이터 로드:', response.data);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // Handpose 모델 초기화 함수
  const initializeHandpose = useCallback(async () => {
    try {
      await tf.setBackend('webgl'); // 또는 'wasm'을 사용할 수 있습니다.
      await tf.ready();
      const net = await handpose.load(); // handpose 모델 로드
      console.log('Handpose model loaded.');

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video); // 손 관절 예측
          if (predictions.length > 0) {
            console.log('손 관절 데이터: ', predictions);
            drawHands(predictions); // 손 관절 시각화
            sendToMLServer(predictions[0].landmarks); // 손 관절 데이터를 서버로 전송
          }
        }
        requestAnimationFrame(detect); // 매 프레임마다 호출
      };

      detect();
    } catch (error) {
      console.error('Handpose 모델 초기화 중 오류 발생:', error);
    }
  }, []);

  // 캔버스에 손 관절 시각화 함수
  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;
      landmarks.forEach((landmark) => {
        const x = landmark[0] * videoWidth;
        const y = landmark[1] * videoHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    });
  };

  // ML 서버로 손 관절 데이터 전송 함수
  const sendToMLServer = async (landmarks) => {
    try {
      console.log('서버로 전송할 손 관절 데이터: ', landmarks);
      const response = await fetch('http://localhost:5000/finger_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: mlIds[currentCharacterIndex], landmarks }),
      });
      const result = await response.json();
      setMlResult(result.result);
      if (result.result === 1) {
        setCurrentCharacterIndex((prevIndex) => (prevIndex + 1) % mlIds.length); // 다음 지문자로 이동
      }

      setTimeout(() => {
        handleNextCharacter(); // 다음 문자 처리
      }, 2000); // 2초 후 자동으로 다음 문자 처리
    } catch (error) {
      console.error('ML 서버와의 통신 오류:', error);
    }
  };

  // 다음 지문자 처리 함수
  const handleNextCharacter = async () => {
    const currentId = mlIds[currentCharacterIndex];
    if (currentId) {
      await sendToMLServer(currentId);
    } else {
      console.error('지문자를 찾을 수 없습니다.');
    }
  };

  // 즐겨찾기 처리 함수
  const handleFavoriteClick = async () => {
    try {
      if (!quizId) {
        console.error('퀴즈 ID가 설정되지 않았습니다.');
        return;
      }

      const response = await toggleFavorite(quizId);
      if (response.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
        setShowPopup(true); // 팝업 표시
      }
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
    }
  };

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <Container className="game-level1-container">
      <div className="game-level1-left">
        <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>
        <div className="word-display">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <div className="word-content">
              <span className="word-item">{currentQuestion?.content}</span>
              <div className="character-display">
                <span className="current-character">
                  현재 맞춰야 하는 지문자: {currentQuestion?.detailed_content[currentCharacterIndex]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="game-level1-right">
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <Webcam ref={webcamRef} className="video-feed" screenshotFormat="image/jpeg" />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {showPopup && <PopupModal message={popupMessage} onClose={handleClosePopup} />}
    </Container>
  );
}

export default GameLevel1;
