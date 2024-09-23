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
      </div>
    </Container>
  );
}

export default VowelDetail;
