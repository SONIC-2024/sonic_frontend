import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';  // 기존 API 호출 함수
import './WordDetail.css';

function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태 추가

  useEffect(() => {
    if (id) {
      loadWord();
    }
  }, [id]);

  const loadWord = async () => {
    try {
      setLoading(true);
      const wordData = await fetchWordInfo(id);  // 기존 API 호출 함수
      console.log('API 응답:', wordData);
      if (wordData && wordData.success && wordData.data.content.length > 0) {
        const fetchedWord = wordData.data.content[0];
        setWord(fetchedWord);
        console.log('단어 정보:', fetchedWord);

        // 단어 ID가 71-80 사이일 경우만 ML 서버로 전송
        if (parseInt(id, 10) >= 71 && parseInt(id, 10) <= 80) {
          sendWordToMl(fetchedWord.content); // Flask 서버로 단어 전송
        }
      } else {
        setError('단어 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('단어 정보를 불러오는 중 오류 발생:', error);
      setError('단어 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ML 서버로 단어 전송 및 결과 처리 함수
  const sendWordToMl = async (word) => {
    try {
      const response = await fetch('http://localhost:5000/finger_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: word }),  // 단어 데이터를 ML 서버로 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // Flask로부터 받은 응답 로그
      setMlResult(result.result); // 결과 저장 (0 또는 1)
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="word-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : word ? (
          <>
            <p className="word-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
              {word.content}  {/* 여기서 제대로 단어가 출력되는지 추가 콘솔 로그 확인 */}
            </p>
            {console.log("단어 표시 중: ", word.content)}

            {/* ML 서버에서 받은 결과 표시 */}
            {mlResult !== null && (
              <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
              </p>
            )}
          </>
        ) : (
          <p>단어 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5000/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default WordDetail;
