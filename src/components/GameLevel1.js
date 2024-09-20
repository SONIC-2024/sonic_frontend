import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite, handleQuizAnswer } from '../api';
import './GameLevel1.css';

function GameLevel1() {
  const [currentCharacter, setCurrentCharacter] = useState('');
  const [quizId, setQuizId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect 내에서 quizId 설정 후, quizId가 변경될 때만 loadQuizData 호출
  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 30) + 1;
    setQuizId(randomQuizId); // quizId만 설정하고
  }, []);

  useEffect(() => {
    if (quizId) {
      loadQuizData(quizId); // quizId가 설정된 후에만 데이터 로딩
    }
  }, [quizId]);

  const loadQuizData = async (quizId) => {
    try {
      setIsLoading(true);
      const response = await fetchLevel1Quiz(quizId);
      console.log('API 응답:', response);

      if (response && response.success) {
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
      if (!quizId) {
        console.error('퀴즈 ID가 설정되지 않았습니다.');
        return;
      }
      await toggleFavorite(quizId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    try {
      const response = await handleQuizAnswer(quizId, answer);
      console.log('정답 처리 결과:', response);
    } catch (error) {
      console.error('정답 처리 중 오류 발생:', error);
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
