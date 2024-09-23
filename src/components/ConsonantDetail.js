import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';
import './ConsonantDetail.css';
import * as handpose from '@tensorflow-models/handpose'; // 손 관절 모델
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [consonant, setConsonant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mlResult, setMlResult] = useState(null);

  useEffect(() => {
    if (index) {
      loadConsonantDetail();
    }
    initializeHandpose();
  }, [index]);

  const loadConsonantDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchWordInfo(index);
      if (response && response.success) {
        setConsonant(response.data);
      }
    } catch (error) {
      console.error('자음 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const initializeHandpose = async () => {
    try {
      const net = await handpose.load(); // handpose 모델 로드
      console.log("Handpose model loaded.");

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;

          const predictions = await net.estimateHands(video); // 손 관절 예측
          if (predictions.length > 0) {
            sendToMLServer(predictions[0].landmarks); // 연속적인 손 관절 데이터 전송
          }
        }
        requestAnimationFrame(detect); // 매 프레임마다 호출
      };

      detect();
    } catch (error) {
      console.error("Handpose 모델 초기화 중 오류 발생:", error);
    }
  };

  const sendToMLServer = async (landmarks) => {
    try {
      await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: index, landmarks }), // 손 관절 데이터를 연속적으로 전송
      });
    } catch (error) {
      console.error('ML 서버와의 통신 오류가 발생했습니다.', error); // 오류 디버깅용 메시지
    }
  };

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
      </div>

      {mlResult && (
        <div className="ml-result">
          <p>{mlResult}</p>
        </div>
      )}
    </Container>
  );
}

export default ConsonantDetail;
