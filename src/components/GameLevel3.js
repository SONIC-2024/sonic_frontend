import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel3Quiz, toggleFavorite } from '../api'; // fetchLevel3Quiz API 호출 함수 추가
import './GameLevel3.css';

function GameLevel3() {
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 상태
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [isLoading, setIsLoading] = useState(true);
  const [renderFlag, setRenderFlag] = useState(false); // 강제로 리렌더링을 트리거하는 플래그
  const [favoriteMessage, setFavoriteMessage] = useState(''); // 즐겨찾기 팝업 메시지
  const [showFavoritePopup, setShowFavoritePopup] = useState(false); // 즐겨찾기 팝업 상태
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 10) + 200; // 200에서 209 사이의 랜덤 ID 생성
    loadQuizData(randomQuizId); // 랜덤하게 생성된 quizId로 데이터 로드
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      const response = await fetchLevel3Quiz(quizId); // API 호출하여 데이터 가져오기
      if (response.success) {
        setCurrentQuestion(response.data); // 퀴즈 데이터 설정
        setIsFavorite(response.data.starred || false); // 즐겨찾기 상태 설정
        setIsLoading(false); // 로딩 상태 해제
        console.log("퀴즈 데이터 로드:", response.data.starred);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const handleFavoriteClick = async () => {
    const favoriteQuizId = currentQuestion?.quiz_id || 200;  // 현재 퀴즈의 ID 사용
  
    try {
      console.log("즐겨찾기에 사용할 퀴즈 ID:", favoriteQuizId); // 현재 퀴즈 ID 확인
      const response = await toggleFavorite(favoriteQuizId); // 현재 퀴즈 ID로 즐겨찾기 요청
      if (response.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // 즐겨찾기 상태 반전

        // 즐겨찾기 팝업 메시지 설정
        if (newFavoriteState) {
          setFavoriteMessage('즐겨찾기에 등록되었습니다.');
        } else {
          setFavoriteMessage('즐겨찾기에서 해제되었습니다.');
        }

        // 팝업 상태를 true로 설정하여 팝업 표시
        setShowFavoritePopup(true);
        setTimeout(() => {
          setShowFavoritePopup(false); // 2초 후 팝업 숨김
        }, 2000);

        console.log('즐겨찾기 클릭 후 상태:', newFavoriteState);
      }
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
            <span className="word-item">{currentQuestion?.content}</span> // 퀴즈 내용 표시
          )}
        </div>
      </div>
      <div className="game-level3-right">
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`} // 상태에 따라 클래스 변경
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
        </div>
      </div>

      {/* 즐겨찾기 팝업 */}
      {showFavoritePopup && (
        <div className="favorite-popup">
          <p>{favoriteMessage}</p>
        </div>
      )}
    </Container>
  );
}

export default GameLevel3;
