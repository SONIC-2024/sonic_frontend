import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchLevel1Quiz } from '../api';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';
import './GameLevel1.css';

function PopupModal({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 2초 후 팝업을 자동으로 닫음
    }, 2000); // 2초 지속
    return () => clearTimeout(timer); // 타이머 클리어
  }, [onClose]);

  return (
    <div className="popup-modal" style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "rgba(0, 0, 0, 0.9)", // 검정색 배경
      color: "white", // 흰색 텍스트
      padding: "20px 30px",
      borderRadius: "10px",
      zIndex: 1000,
      maxWidth: "300px",
      textAlign: "center",
      fontSize: "16px"
    }}>
      <div className="popup-content">
        <span>{message}</span>
      </div>
    </div>
  );
}

function GameLevel1() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

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
              drawHands(predictions);
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
        const randomQuizId = Math.floor(Math.random() * 30) + 1;
        const response = await fetchLevel1Quiz(randomQuizId);
        if (response.success) {
          setCurrentQuestion(response.data);
        } else {
          console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
        }
      } catch (error) {
        console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    loadQuizData();
    initializeHandpose();
  }, [initializeHandpose]);

  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
    setShowPopup(true);
  };

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
              <span className="word-item">{currentQuestion.content}</span>
            </div>
          ) : (
            <span>Loading...</span>
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
