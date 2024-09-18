import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite } from '../api'; // API 함수 가져오기
import './GameLevel1.css';

function GameLevel1() {
  const [currentCharacter, setCurrentCharacter] = useState('');
  const [quizId, setQuizId] = useState(null); // 퀴즈 ID 저장
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 30) + 1; // 1-99 범위의 랜덤 퀴즈 ID 선택
    setQuizId(randomQuizId);
    loadQuizData(randomQuizId); // 선택된 퀴즈 ID로 퀴즈 데이터 불러오기
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      setIsLoading(true); // 로딩 시작
      const response = await fetchLevel1Quiz(quizId); // API 호출
      console.log('API 응답:', response);

      if (response && response.success) {
        setCurrentCharacter(response.data.content); // 퀴즈 데이터를 설정
        setIsFavorite(response.data.isStarred || false); // 즐겨찾기 상태 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('오류 발생:', error.message);
    } finally {
      setIsLoading(false); // 로딩 완료
    }
  };

  const handleFavoriteClick = async () => {
    try {
      if (!quizId) {
        console.error('퀴즈 ID가 설정되지 않았습니다.');
        return;
      }
      await toggleFavorite(quizId); // 즐겨찾기 토글
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
          <p>Loading...</p> // 로딩 중 메시지
        ) : currentCharacter ? (
          <p className="random-character">{currentCharacter}</p> // 퀴즈 데이터 표시
        ) : (
          <p>퀴즈 데이터를 불러올 수 없습니다.</p>
        )}
      </div>
      <div className="game-level1-right">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" /> {/* 캠 피드 */}
      </div>
    </Container>
  );
}

export default GameLevel1;