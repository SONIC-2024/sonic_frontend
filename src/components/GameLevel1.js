import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite } from '../api'; // API 함수 가져오기
import './GameLevel1.css';

function GameLevel1() {
  const [currentCharacter, setCurrentCharacter] = useState('');
  const [quizId, setQuizId] = useState(null); // 추가된 상태: 퀴즈 ID
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      const response = await fetchLevel1Quiz();
      console.log('API 응답:', response); // 응답 구조를 확인
      
      if (response && response.success) {
        setCurrentCharacter(response.data.content); // API에서 받은 퀴즈 데이터 설정
        setQuizId(response.data.id); // API에서 받은 퀴즈 ID 설정
        setIsFavorite(response.data.isFavorite || false); // API에서 받은 즐겨찾기 상태 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      handleError(error); // 수정된 에러 핸들링 함수 호출
    }
  };

  const handleFavoriteClick = async () => {
    try {
      if (quizId === null) {
        console.error('퀴즈 ID가 설정되지 않았습니다.');
        return;
      }
      await toggleFavorite(quizId); // 퀴즈 ID를 이용해 즐겨찾기 토글 API 호출
      setIsFavorite(!isFavorite); // 즐겨찾기 상태 토글
    } catch (error) {
      handleError(error); // 수정된 에러 핸들링 함수 호출
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 수정된 에러 핸들러 함수
  const handleError = (error) => {
    if (error.response) {
      // 서버가 응답을 반환했으나 2xx 범위에 있지 않음
      console.error('서버 응답 오류:', error.response.data);
    } else if (error.request) {
      // 요청이 이루어졌으나 응답이 없음
      console.error('요청 오류:', error.request);
    } else {
      // 오류가 발생한 요청을 설정하는 중 문제 발생
      console.error('오류 발생:', error.message);
    }
    console.error('오류 설정:', error.config ? JSON.stringify(error.config, null, 2) : '없음');
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
        {currentCharacter ? (
          <p className="random-character">{currentCharacter}</p>
        ) : (
          <p>Loading...</p> // 데이터를 로드하는 동안 사용자에게 로딩 중임을 알림
        )}
      </div>
      <div className="game-level1-right">
        <p className="cam-placeholder">CAM</p>
      </div>
    </Container>
  );
}

export default GameLevel1;
