import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api'; 
import './ConsonantDetail.css';
import { Hands } from '@mediapipe/hands';

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [consonant, setConsonant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mlResult, setMlResult] = useState(null);
  const [hands, setHands] = useState(null);

  useEffect(() => {
    if (index) {
      loadConsonantDetail();
    }
    initializeMediaPipe();
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

  const initializeMediaPipe = () => {
    const handsModule = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsModule.setOptions({
      maxNumHands: 1,  // 한 손만 인식
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    handsModule.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHands(results.multiHandLandmarks[0]);
        sendToMLServer(results.multiHandLandmarks[0]); // 손 관절 데이터를 서버로 전송
      } else {
        setHands(null);
      }
    });

    const startCamera = async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
          handsModule.send({ image: video });
          requestAnimationFrame(startCamera);  // 지속적으로 프레임마다 인식 요청
        }
      }
    };

    const intervalId = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        handsModule.send({ image: webcamRef.current.video });
      }
    }, 100); // 매 100ms마다 손 관절 분석

    return () => clearInterval(intervalId); // 컴포넌트가 언마운트되면 정리
  };

  const sendToMLServer = async (landmarks) => {
    try {
      const response = await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: index, landmarks }), // 손 관절 데이터를 전송
      });

      const result = await response.json();
      setMlResult(result.result === 1 ? '정답입니다!' : '오답입니다!');
    } catch (error) {
      console.log('ML 서버와의 통신 오류가 발생했습니다.');
      // 화면에 오류 메시지를 보여주지 않고 콘솔에만 출력하도록 수정
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
