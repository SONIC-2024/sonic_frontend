import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api'; // API 불러오기
import './ConsonantDetail.css';

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [consonant, setConsonant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (index) {
      loadConsonantDetail();
    }
  }, [index]);

  const loadConsonantDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchWordInfo(index);
      if (response && response.success) {
        setConsonant(response.data);
      } else {
        setError('자음 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      setError('자음 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
              />
              <img 
                src={`/images/consonant${index}.png`} 
                alt={`Consonant ${index} Small`} 
                className="small-image" 
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
    </Container>
  );
}

export default ConsonantDetail;
