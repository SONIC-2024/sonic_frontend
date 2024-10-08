import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchLevel1Quiz } from '../api'; // DB에서 퀴즈 데이터를 가져오는 API 호출
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import './GameLevel1.css';

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
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 저장
  const [isFavorite, setIsFavorite] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
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
        const startTime = Date.now();
        let collectedResults = [];
        const intervalId = setInterval(async () => {
          if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const predictions = await net.estimateHands(video);
            if (predictions.length > 0) {
              drawHands(predictions); // 손 관절 시각화
              const result = await sendToMLServer(predictions[0].landmarks);
              collectedResults.push(result);
            }
          }
          if (Date.now() - startTime >= 5000) {
            clearInterval(intervalId);
            const avgResult =
              collectedResults.reduce((a, b) => a + b, 0) /
              collectedResults.length;
            setPopupMessage(avgResult > 0 ? '정답입니다!' : '오답입니다!');
            setShowPopup(true);
          }
        }, 1000);
      };
      detect();
    } catch (error) {
      console.error('Handpose 모델 초기화 중 오류 발생:', error);
    }
  }, []);

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
        body: JSON.stringify({ id: currentQuestion?.id, landmarks }),
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
        const randomQuizId = Math.floor(Math.random() * 30) + 1; // 1~30 사이의 퀴즈 ID 랜덤 생성
        const response = await fetchLevel1Quiz(randomQuizId);
        if (response.success) {
          setCurrentQuestion(response.data); // 퀴즈 데이터 설정
        } else {
          console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
        }
      } catch (error) {
        console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    loadQuizData(); // 컴포넌트가 마운트될 때 퀴즈 데이터 로드
    initializeHandpose(); // Handpose 모델 초기화
  }, [initializeHandpose]);

  // 즐겨찾기 처리 함수
  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
    setShowPopup(true); // 팝업 표시
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
          {currentQuestion ? (
            <div className="word-content">
              <span className="word-item">{currentQuestion.content}</span> {/* DB에서 불러온 단어 */}
              <div className="character-display">
                <span className="current-character">
                  현재 맞춰야 하는 지문자: {currentQuestion.detailed_content[0]} {/* 첫 번째 지문자 표시 */}
                </span>
              </div>
            </div>
          ) : (
            <span>Loading...</span> // 로딩 상태
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
          <canvas ref={canvasRef} className="canvas" />
        </div>
      </div>

      {showPopup && <PopupModal message={popupMessage} onClose={handleClosePopup} />}
    </Container>
  );
}

export default GameLevel1;
