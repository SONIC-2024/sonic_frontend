import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';
import './VowelDetail.css';

function VowelDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [vowel, setVowel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlResult, setMlResult] = useState(null);

  useEffect(() => {
    if (index) {
      loadVowelDetail();
    }
  }, [index]);

  const loadVowelDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchWordInfo(index);
      if (response && response.success) {
        setVowel(response.data);
      } else {
        setError('모음 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      setError('모음 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sendToMLServer = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      try {
        const response = await fetch('http://localhost:5000/finger_learn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: index }),  // 모음 ID를 ML 서버로 전송
        });

        const result = await response.json();
        setMlResult(result.result === 1 ? '정답입니다!' : '오답입니다!');
      } catch (error) {
        setError('ML 서버와의 통신 오류가 발생했습니다.');
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="vowel-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {vowel ? (
          <>
            <div className="image-container">
              <p className="vowel-character">{vowel.content}</p>
              <img 
                src={`/images/Vowel${index}.gif`} 
                alt={`Vowel ${index} Large`} 
                className="large-image" 
              />
              <img 
                src={`/images/vowel${index}.png`} 
                alt={`Vowel ${index} Small`} 
                className="small-image" 
              />
            </div>
          </>
        ) : (
          <p>모음 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
          mirrored={false}
        />
        <button onClick={sendToMLServer}>
          ML 서버로 전송
        </button>
      </div>

      {mlResult && (
        <div className="ml-result">
          <p>{mlResult}</p>
        </div>
      )}
    </Container>
  );
}

export default VowelDetail;
