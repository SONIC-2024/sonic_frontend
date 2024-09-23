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
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태
  const [repeatCount, setRepeatCount] = useState(0); // 반복 횟수
  const [isRunning, setIsRunning] = useState(false); // 손 모양 확인 중인지 여부

  useEffect(() => {
    if (index) {
      loadConsonantDetail();
    }
  }, [index]);

  useEffect(() => {
    if (repeatCount > 0 && repeatCount <= 3) {
      // 10초 동안 손 모양 확인 후 ML 서버로 데이터 전송
      const timer = setTimeout(() => {
        const consonantId = parseInt(index, 10);
        if (consonantId >= 1 && consonantId <= 14) {
          sendConsonantToMl(consonantId);
        }
      }, 10000); // 10초 타이머

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    } else if (repeatCount > 3) {
      resetConsonant(); // 3번 반복 후 리셋
    }
  }, [repeatCount]);

  const loadConsonantDetail = async () => {
    try {
      setLoading(true);
      const consonantData = await fetchWordInfo(index); // 자음 세부 정보를 가져오는 API 호출
      if (consonantData) {
        setConsonant(consonantData);
        startConsonantCheck(); // 자음 정보를 로드한 후 손 모양 확인 시작
      } else {
        setError('자음 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      setError('자음 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 손 모양 확인을 시작하는 함수
  const startConsonantCheck = () => {
    setIsRunning(true); // 손 모양 확인 시작
    setRepeatCount(1); // 첫 번째 시도
  };

  // ML 서버로 자음 데이터를 전송하는 함수
  const sendConsonantToMl = async (consonantId) => {
    try {
      const response = await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: consonantId }),  // 자음 데이터를 ML 서버로 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // ML 서버로부터 받은 응답 로그
      setMlResult(result.result); // 결과 저장 (0 또는 1)

      // 다음 반복으로 이동
      if (repeatCount < 3) {
        setRepeatCount(repeatCount + 1); // 반복 횟수 증가
      }
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
    }
  };

  // 3번 시도 후 화면을 리셋하는 함수
  const resetConsonant = () => {
    setRepeatCount(0); // 반복 횟수 초기화
    setMlResult(null); // 결과 초기화
    setIsRunning(false); // 손 모양 확인 종료
    alert("손 모양 인식이 3회 종료되었습니다.");
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

            {/* ML 서버에서 받은 결과 표시 */}
            {mlResult !== null && (
              <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
              </p>
            )}

            {/* 3번 시도 후 종료 메시지 */}
            {repeatCount > 3 && <p style={{ fontSize: '18px', color: 'blue' }}>손 모양 인식이 종료되었습니다.</p>}
          </>
        ) : (
          <p>자음 정보를 불러올 수 없습니다.</p>
        )}
      </div>
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5000/video_feed_finger" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default ConsonantDetail;
