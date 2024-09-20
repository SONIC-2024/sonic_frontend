import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api'; // 자음 세부 정보를 가져오는 API
import './ConsonantDetail.css';

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [consonant, setConsonant] = useState(null); // 자음 세부 정보 상태
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
      const consonantData = await fetchWordInfo(index); // 자음 세부 정보를 가져오는 API 호출
      if (consonantData) {
        setConsonant(consonantData);
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

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="consonant-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {consonant ? (
          <>
            <img src={consonant.objectUrl} alt={`consonant${index}`} className="consonant-detail-image" />
            <p className="consonant-character">{consonant.title}</p>
          </>
        ) : (
          <p>자음 정보를 불러올 수 없습니다.</p>
        )}
      </div>
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default ConsonantDetail;
