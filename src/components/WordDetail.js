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

        // 단어를 Flask 서버로 전송
        sendWordToFlask(fetchedWord.content);
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

  const sendWordToFlask = async (word) => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),  // 단어 데이터를 Flask로 전송
      });

      const result = await response.json();
      console.log('Flask 응답:', result);  // Flask로부터 받은 응답 로그
    } catch (error) {
      console.error('Flask로 데이터 전송 중 오류 발생:', error);
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
    </>
  ) : (
    <p>단어 정보를 불러올 수 없습니다.</p>
  )}
</div>

      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default WordDetail;
