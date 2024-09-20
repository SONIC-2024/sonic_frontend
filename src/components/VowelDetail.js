import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api'; // 모음 세부 정보를 가져오는 API
import './VowelDetail.css';

function VowelDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [vowel, setVowel] = useState(null); // 모음 세부 정보 상태
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
      const vowelData = await fetchWordInfo(index); // 모음 세부 정보를 가져오는 API 호출
      setVowel(vowelData);
    } catch (error) {
      setError('모음 정보를 불러오는 중 오류가 발생했습니다.');
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
    <Container className="vowel-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {vowel ? (
          <>
            <img src={vowel.objectUrl} alt={`vowel${index}`} className="vowel-detail-image" />
            <p className="vowel-character">{vowel.title}</p>
          </>
        ) : (
          <p>모음 정보를 불러올 수 없습니다.</p>
        )}
      </div>
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default VowelDetail;
