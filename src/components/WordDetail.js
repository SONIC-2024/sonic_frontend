import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';
import './WordDetail.css';
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js 객체 가져오기
import '@tensorflow/tfjs-backend-webgl'; // WebGL 백엔드 추가
import '@tensorflow/tfjs-backend-wasm'; // WASM 백엔드 추가

function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null); // 웹캠 참조 추가
  const canvasRef = useRef(null); // 캔버스 참조 추가
  const [word, setWord] = useState(null);
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태 추가
  const [popupMessage, setPopupMessage] = useState('');

  // 단어 정보를 불러오는 함수
  const loadWord = useCallback(async () => {
    try {
      const wordData = await fetchWordInfo(id);
      if (wordData && wordData.success) {
        setWord(wordData.data.content);
      } else {
        console.error('단어 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('단어 정보를 불러오는 중 오류가 발생했습니다.', error);
    }
  }, [id]);

  // Handpose 모델 초기화 및 손 관절 추출 함수
  const initializeHandpose = useCallback(async () => {
    try {
      await tf.setBackend('webgl'); // 또는 'wasm' 사용 가능
      await tf.ready(); // 백엔드 준비 완료
      const net = await handpose.load(); // Handpose 모델 로드
      console.log('Handpose model loaded.');

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video); // 손 관절 예측

          if (predictions.length > 0) {
            console.log('손 관절 데이터: ', predictions); // 손 관절 데이터 확인
            drawHands(predictions); // 손 관절 시각화
            sendToMLServer(predictions[0].landmarks); // 서버로 전송
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

      // 손 관절 좌표를 웹캠 해상도에 맞게 변환
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
      const response = await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, landmarks }), // 단어 ID와 손 관절 데이터 전송
      });

      const data = await response.json();
      setMlResult(data.result === 1 ? '정답입니다!' : '오답입니다!');
      setPopupMessage(data.result === 1 ? '정답입니다!' : '오답입니다!');

      setTimeout(() => {
        setPopupMessage('');
      }, 3000); // 3초 후 팝업 메시지 사라짐
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    loadWord(); // 단어 정보 불러오기
    initializeHandpose(); // Handpose 모델 초기화
  }, [loadWord, initializeHandpose]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="word-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {word ? (
          <>
            <p className="word-text">{word}</p>
            <p>남은 시도 횟수: 3</p>
          </>
        ) : (
          <p>단어 정보를 불러올 수 없습니다.</p>
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

export default WordDetail;
