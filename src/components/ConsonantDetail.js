import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';
import './ConsonantDetail.css';
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import '@tensorflow/tfjs-backend-webgl';  // WebGL 백엔드 추가
import '@tensorflow/tfjs-backend-wasm';   // WASM 백엔드 추가

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);  // 캔버스 레퍼런스 추가
  const [consonant, setConsonant] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [timer, setTimer] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');

  // 자음 정보를 불러오는 함수
  const loadConsonantDetail = useCallback(async () => {
    try {
      const response = await fetchWordInfo(index);
      if (response && response.success) {
        setConsonant(response.data);
      }
    } catch (error) {
      console.error('자음 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [index]);

  // Handpose 모델 초기화 함수
  const initializeHandpose = useCallback(async () => {
    try {
      await tf.setBackend('webgl'); // 또는 'wasm'을 사용할 수 있습니다.
      await tf.ready(); // 백엔드 준비 완료
      console.log('TensorFlow.js 백엔드 로드 완료:', tf.getBackend());

      const net = await handpose.load(); // handpose 모델 로드
      console.log("Handpose model loaded.");

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video); // 손 관절 예측
          if (predictions.length > 0) {
            console.log("손 관절 데이터: ", predictions);  // 콘솔 로그로 손 관절 데이터 확인
            drawHands(predictions);  // 손 관절 시각화
            sendToMLServer(predictions[0].landmarks); // 손 관절 데이터를 연속적으로 전송
          }
        }
        requestAnimationFrame(detect); // 매 프레임마다 호출
      };

      detect();
    } catch (error) {
      console.error("Handpose 모델 초기화 중 오류 발생:", error);
    }
  }, []);

  // 캔버스에 손 관절 시각화 함수
  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화
    predictions.forEach(prediction => {
      const landmarks = prediction.landmarks;
      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i][0];
        const y = landmarks[i][1];
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  // ML 서버로 데이터 전송 함수
  const sendToMLServer = async (landmarks) => {
    try {
      console.log("서버로 전송할 손 관절 데이터: ", landmarks);  // 전송할 데이터 확인
      await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: index, landmarks }), // 손 관절 데이터를 연속적으로 전송
      }).then((response) => response.json())
        .then((data) => {
          setMlResult(data.result === 1 ? '정답입니다!' : '오답입니다!');
          setPopupMessage(data.result === 1 ? '정답입니다!' : '오답입니다!');
          setTimeout(() => {
            setPopupMessage(''); // 3초 후 팝업 메시지 사라짐
          }, 3000);
        });

      // 10초 내에 결론이 나오지 않으면 '오답입니다!' 처리
      clearTimeout(timer);
      setTimer(setTimeout(() => {
        if (!mlResult) {
          setMlResult('오답입니다!');
          setPopupMessage('오답입니다!');
          setTimeout(() => {
            setPopupMessage('');
          }, 3000);
        }
      }, 10000));
    } catch (error) {
      console.error('ML 서버와의 통신 오류가 발생했습니다.', error);
    }
  };

  // 화면 렌더링 시 자음 정보 및 Handpose 모델 로드
  useEffect(() => {
    loadConsonantDetail();
    initializeHandpose();
  }, [loadConsonantDetail, initializeHandpose]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="consonant-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {consonant ? (
          <>
            <div className="image-container">
              <p className="consonant-character">{consonant.content}</p>
              <img 
                src={`/images/Consonant${index}.gif`} 
                alt={`Consonant ${index} Large`} 
                className="large-image" 
                onError={(e) => { e.target.src = '/images/default.gif'; }}
              />
              <img 
                src={`/images/consonant${index}.png`} 
                alt={`Consonant ${index} Small`} 
                className="small-image" 
                onError={(e) => { e.target.src = '/images/default.png'; }}
              />
            </div>
          </>
        ) : (
          <p>자음 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
          mirrored={false}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
        />
      </div>

      {popupMessage && (
        <div className="popup-message">
          <p>{popupMessage}</p>
        </div>
      )}
    </Container>
  );
}

export default ConsonantDetail;
