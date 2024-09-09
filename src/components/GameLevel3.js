import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel3Quiz, toggleFavorite } from '../api';  // fetchLevel3Quiz API 호출 함수 추가
import './GameLevel3.css';

function GameLevel3() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태 추가
  const [score, setScore] = useState(0);  // 점수 추가
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      const response = await fetchLevel3Quiz();
      if (response.success) {
        setQuestions([response.data.content]);  // 응답이 단일 객체일 경우
        setIsFavorite(response.data.isFavorite || false);  // API에서 받은 즐겨찾기 상태 설정, 기본값은 false
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(questions[currentIndex].id);  // 즐겨찾기 토글 API 호출
      setIsFavorite(!isFavorite);  // 즐겨찾기 상태 토글
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert(`게임 종료! 당신의 점수: ${score}/${questions.length}`);
      navigate('/');  // 홈 화면으로 이동
    }
  };

  return (
    <Container className="game-level3-container">
      <div className="game-level3-left">
        <button className="back-button" onClick={handleGoBack}>&larr;</button>
        <div className="word-display">
          {questions.length > 0 ? (
            <span className="word-item">{questions[currentIndex]}</span>
          ) : (
            <span>Loading...</span>
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
        <span className="cam-placeholder">CAM</span>
      </div>
      {currentIndex < questions.length && (
        <button onClick={handleNextQuestion} className="next-button">다음</button>
      )}
    </Container>
  );
}

export default GameLevel3;
