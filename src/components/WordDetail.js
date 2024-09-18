import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';
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
      const wordData = await fetchWordInfo(id);
      console.log('API 응답:', wordData);
      if (wordData && wordData.success && wordData.data.content.length > 0) {
        const fetchedWord = wordData.data.content[0];
        setWord(fetchedWord);
        console.log('단어 정보:', fetchedWord);
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
          <p className="word-text" style={{ fontSize: '48px', color: 'black' }}>
            {word.content}
          </p>  // word.content를 통해 단어를 출력
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
