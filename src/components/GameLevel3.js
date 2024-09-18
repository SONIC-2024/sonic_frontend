import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel3Quiz, toggleFavorite } from '../api'; // fetchLevel3Quiz API 호출 함수 추가
import './GameLevel3.css';

function GameLevel3() {
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 상태
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizData(200); // quiz-id 200으로 설정
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      const response = await fetchLevel3Quiz(quizId); // API 호출하여 데이터 가져오기
      if (response && response.success) {
        setCurrentQuestion(response.data.content); // 퀴즈 내용 설정
        setIsFavorite(response.data.isStarred || false); // 즐겨찾기 상태 설정
        setIsLoading(false); // 로딩 상태 해제
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response?.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(currentQuestion.id); // 즐겨찾기 토글 API 호출
      setIsFavorite(!isFavorite); // 즐겨찾기 상태 토글
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <Container className="game-level3-container">
      <div className="game-level3-left">
        <button className="back-button" onClick={handleGoBack}>&larr;</button>
        <div className="word-display">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span className="word-item">{currentQuestion}</span> // 퀴즈 내용 표시
          )}
        </div>
      </div>
      <div className="game-level3-right">
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`} 
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
        </div>
      </div>
    </Container>
  );
}

export default GameLevel3;
