import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel3Quiz, toggleFavorite } from '../api';
import './GameLevel3.css';
import * as poseDetection from '@tensorflow-models/pose-detection'; // 포즈 모델 추가
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import '@tensorflow/tfjs-backend-webgl'; // WebGL 백엔드 추가
import Webcam from 'react-webcam'; // Webcam 컴포넌트 추가

function GameLevel3() {
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 상태
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteMessage, setFavoriteMessage] = useState(''); // 즐겨찾기 팝업 메시지
  const [showFavoritePopup, setShowFavoritePopup] = useState(false); // 즐겨찾기 팝업 상태
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태
  const [attemptsLeft, setAttemptsLeft] = useState(3); // 3번 반복 시도 횟수
  const [isChecking, setIsChecking] = useState(false); // ML 서버 검사 중 여부
  const [checkInterval, setCheckInterval] = useState(null); // 검사 간격 타이머

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // 캔버스 참조 추가

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 10) + 200; // 200에서 209 사이의 랜덤 ID 생성
    loadQuizData(randomQuizId); // 랜덤하게 생성된 quizId로 데이터 로드
    initializePoseModel(); // 포즈 모델 초기화

    return () => clearInterval(checkInterval); // 컴포넌트 언마운트 시 타이머 클리어
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      const response = await fetchLevel3Quiz(quizId); // API 호출하여 데이터 가져오기
      if (response.success) {
        setCurrentQuestion(response.data); // 퀴즈 데이터 설정
        setIsFavorite(response.data.starred || false); // 즐겨찾기 상태 설정
        setIsLoading(false); // 로딩 상태 해제
        console.log('퀴즈 데이터 로드:', response.data.starred);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // Pose 모델 초기화 함수
  const initializePoseModel = useCallback(async () => {
    try {
      await tf.setBackend('webgl'); // WebGL 백엔드 사용
      await tf.ready();

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });
      console.log('Pose 모델 로드 완료');

      const detectPose = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const poses = await detector.estimatePoses(video); // 포즈 예측

          if (poses.length > 0) {
            console.log('포즈 데이터:', poses);
            drawPoses(poses); // 포즈 시각화
            sendToMLServer(currentQuestion.quiz_id, poses[0].keypoints); // 포즈 데이터 ML 서버로 전송
          }
        }
        requestAnimationFrame(detectPose); // 매 프레임마다 호출
      };

      detectPose();
    } catch (error) {
      console.error('Pose 모델 초기화 중 오류 발생:', error);
    }
  }, [currentQuestion?.quiz_id]);

  // 캔버스에 포즈 시각화 함수
  const drawPoses = (poses) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        const { x, y } = keypoint;
        ctx.beginPath();
        ctx.arc(x * videoWidth, y * videoHeight, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
      });
    });
  };

  // ML 서버로 포즈 데이터 전송 함수
  const sendToMLServer = async (quizId, keypoints) => {
    try {
      const response = await fetch('http://localhost:5000/body_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: quizId, keypoints }), // 포즈 데이터를 ML 서버로 전송
      });
      const result = await response.json();
      console.log('ML 서버 응답:', result); // ML 서버로부터 받은 응답 로그
      setMlResult(result.result);
      return result.result;
    } catch (error) {
      console.error('ML 서버와의 통신 중 오류:', error);
      return null;
    }
  };

  // 즐겨찾기 처리 함수
  const handleFavoriteClick = async () => {
    const favoriteQuizId = currentQuestion?.quiz_id || 200; // 현재 퀴즈의 ID 사용

    try {
      console.log('즐겨찾기에 사용할 퀴즈 ID:', favoriteQuizId); // 현재 퀴즈 ID 확인
      const response = await toggleFavorite(favoriteQuizId); // 즐겨찾기 요청
      if (response.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // 즐겨찾기 상태 반전

        setFavoriteMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
        setShowFavoritePopup(true); // 팝업 표시
        setTimeout(() => setShowFavoritePopup(false), 2000); // 2초 후 팝업 숨김
      }
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <Container className="game-level3-container">
      <div className="game-level3-left">
        <button className="back-button" onClick={handleGoBack}>
          &larr;
        </button>
        <div className="word-display">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span className="word-item">{currentQuestion?.content}</span> // 퀴즈 내용 표시
          )}
        </div>
      </div>

      <div className="game-level3-right">
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`} // 상태에 따라 클래스 변경
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <Webcam ref={webcamRef} className="video-feed" screenshotFormat="image/jpeg" />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>

      {/* 즐겨찾기 팝업 */}
      {showFavoritePopup && (
        <div className="favorite-popup">
          <p>{favoriteMessage}</p>
        </div>
      )}
    </Container>
  );
}

export default GameLevel3;
