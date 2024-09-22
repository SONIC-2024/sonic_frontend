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
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태

  useEffect(() => {
    if (index) {
      loadVowelDetail();
    }
  }, [index]);

  const loadVowelDetail = async () => {
    try {
      setLoading(true);
      const vowelData = await fetchWordInfo(index); // 모음 세부 정보를 가져오는 API 호출
      if (vowelData) {
        setVowel(vowelData);

        // index 값이 15에서 35 사이인 경우에만 ML 서버로 전송
        const vowelId = parseInt(index, 10);
        if (vowelId >= 15 && vowelId <= 35) {
          sendVowelToMl(vowelId);
        }
      } else {
        setError('모음 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      setError('모음 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ML 서버로 모음 데이터를 전송하는 함수
  const sendVowelToMl = async (vowelId) => {
    try {
      const response = await fetch('http://localhost:5000/finger_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: vowelId }),  // 모음 데이터를 ML 서버로 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // ML 서버로부터 받은 응답 로그
      setMlResult(result.result); // 결과 저장 (0 또는 1)
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
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

            {/* ML 서버에서 받은 결과 표시 */}
            {mlResult !== null && (
              <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
              </p>
            )}
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
