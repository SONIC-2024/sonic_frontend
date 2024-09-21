import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite } from '../api';
import './GameLevel1.css';

function GameLevel1() {
  const { quizId } = useParams(); // URL에서 quizId 가져옴
  const [currentCharacter, setCurrentCharacter] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (quizId) {
      console.log('quizId:', quizId); // quizId가 제대로 들어오는지 확인
      loadQuizData(quizId); // quizId로 데이터 로딩
    }
  }, [quizId]);

  const loadQuizData = async (quizId) => {
    try {
      setIsLoading(true);
      console.log(`Fetching data for quizId: ${quizId}`); // quizId 로그 확인
      const response = await fetchLevel1Quiz(quizId);
      console.log('API 응답:', response); // API 응답 로그 추가
      
      if (response && response.success) {
        console.log('퀴즈 데이터:', response.data.content); // 실제 데이터 확인
        setCurrentCharacter(response.data.content);
        setIsFavorite(response.data.isStarred || false);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('오류 발생:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(quizId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="game-level1-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <button
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
      >
        ★
      </button>
      <div className="game-level1-left">
        {isLoading ? (
          <p>Loading...</p>
        ) : currentCharacter ? (
          <p className="random-character">{currentCharacter}</p>
        ) : (
          <p>퀴즈 데이터를 불러올 수 없습니다.</p>
        )}
      </div>
      <div className="game-level1-right">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default GameLevel1;
