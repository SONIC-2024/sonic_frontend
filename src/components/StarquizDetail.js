import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchQuizDetail } from '../api'; // API 함수 불러오기
import './StarquizDetail.css';
import Webcam from 'react-webcam'; // 웹캠 컴포넌트 추가
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델 추가 (레벨 1)
import * as poseDetection from '@tensorflow-models/pose-detection'; // 포즈 모델 추가 (레벨 3)
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import '@tensorflow/tfjs-backend-webgl'; // WebGL 백엔드 추가

function StarquizDetail() {
  const { level, quizId } = useParams(); // URL에서 레벨과 퀴즈 ID 가져옴
  const [quizDetail, setQuizDetail] = useState(null);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0); // 현재 문자 인덱스 추가
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 오류 상태 추가
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태
  const [attemptsLeft, setAttemptsLeft] = useState(3); // 3번 반복 시도 횟수
  const [isChecking, setIsChecking] = useState(false); // ML 서버 검사 중 여부
  const [checkInterval, setCheckInterval] = useState(null); // 검사 간격 타이머

  const navigate = useNavigate(); // navigate 함수 사용
  const webcamRef = useRef(null); // 웹캠 참조
  const canvasRef = useRef(null); // 캔버스 참조

  useEffect(() => {
    const loadQuizDetail = async () => {
      try {
        const response = await fetchQuizDetail(level, quizId);
        if (response.data.quiz_id <= 30 || level !== '1') {
          setQuizDetail(response.data);
        } else {
          setError('해당 퀴즈는 레벨 1의 범위에 맞지 않습니다.');
        }
      } catch (error) {
        console.error('퀴즈 정보를 불러오는 중 오류:', error);
        setError('퀴즈 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuizDetail();

    // 레벨 3에서 포즈 모델을 초기화
    if (level === '3') {
      initializePoseModel();
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(checkInterval);
  }, [level, quizId]);

  // 손 인식 모델 초기화 함수 (레벨 1)
  const initializeHandpose = useCallback(async () => {
    if (level === '1') {
      try {
        await tf.setBackend('webgl'); // WebGL 백엔드 사용
        await tf.ready();

        const net = await handpose.load(); // handpose 모델 로드
        console.log('Handpose 모델 로드 완료');

        const detect = async () => {
          if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const predictions = await net.estimateHands(video); // 손 관절 예측

            if (predictions.length > 0) {
              console.log('손 관절 데이터:', predictions);
              drawHands(predictions); // 손 관절 시각화
              sendIdToMl(quizDetail?.quiz_id); // 예측 결과를 ML 서버로 전송
            }
          }
          requestAnimationFrame(detect); // 매 프레임마다 호출
        };

        detect();
      } catch (error) {
        console.error('Handpose 모델 초기화 중 오류 발생:', error);
      }
    }
  }, [quizDetail?.quiz_id]);

  // 포즈 모델 초기화 함수 (레벨 3)
  const initializePoseModel = useCallback(async () => {
    if (level === '3') {
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
              sendIdToMl(quizDetail?.quiz_id, poses[0].keypoints); // 포즈 데이터 ML 서버로 전송
            }
          }
          requestAnimationFrame(detectPose); // 매 프레임마다 호출
        };

        detectPose();
      } catch (error) {
        console.error('Pose 모델 초기화 중 오류 발생:', error);
      }
    }
  }, [quizDetail?.quiz_id]);

  // 손 관절 시각화 함수
  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화

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

  // 포즈 시각화 함수 (레벨 3)
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

  // ML 서버로 데이터 전송 함수 (레벨에 따라 다르게 설정)
  const sendIdToMl = async (id) => {
    const apiEndpoint = level === '1' ? 'finger_quiz' : 'body_quiz'; // 레벨에 따라 다른 엔드포인트 사용
    try {
      const response = await fetch(`http://localhost:5000/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }), // 레벨에 맞는 ID 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // Flask로부터 받은 응답 로그
      setMlResult(result.result); // 결과 저장 (0 또는 1)
      return result.result;
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
      return null;
    }
  };

  const handleGoBack = () => {
    navigate(`/starquiz`); // Starquiz 페이지로 돌아가기
  };

  return (
    <Container className="starquiz-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : quizDetail ? (
          <>
            {level === '3' && (
              <>
                <p className="quiz-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                  {quizDetail.content ? quizDetail.content : "No Content Available"} {/* content 사용 */}
                </p>
                {mlResult !== null && (
                  <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                    {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
                  </p>
                )}
              </>
            )}

            {level === '1' && (
              <>
                <p className="quiz-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                  {quizDetail.content ? quizDetail.content : "No Content Available"} {/* content 사용 */}
                </p>
                <p className="current-character" style={{ fontSize: '48px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                  현재 맞춰야 하는 지문자: {quizDetail.detailed_content?.[currentCharacterIndex] || "No Character Available"} {/* 지문자 표시 */}
                </p>
                {mlResult !== null && (
                  <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                    {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <p>퀴즈 정보를 불러올 수 없습니다.</p>
        )}
      </div>

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
    </Container>
  );
}

export default StarquizDetail;
