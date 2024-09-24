import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchLevel1Quiz } from '../api'; // DB에서 퀴즈 데이터를 가져오는 API 호출
import './GameLevel1.css';

// 팝업 모달 컴포넌트
function PopupModal({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 일정 시간 후 자동으로 모달 닫기
    }, 2000); // 2초 후 자동으로 닫힘
    return () => clearTimeout(timer); // 컴포넌트가 언마운트되면 타이머 클리어
  }, [onClose]);

  return (
    <div className="popup-modal">
      <div className="modal-content">
        <span>{message}</span>
      </div>
    </div>
  );
}

function GameLevel1() {
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 저장
  const [isFavorite, setIsFavorite] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  // 컴포넌트가 마운트될 때 3초 후 팝업이 뜨도록 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupMessage('정답입니다!'); // 팝업 메시지 설정
      setShowPopup(true); // 팝업 표시
    }, 7000); // 3초 후 실행

    return () => clearTimeout(timer); // 컴포넌트가 언마운트될 때 타이머 클리어
  }, []);

  // 퀴즈 데이터를 불러오는 함수
  const loadQuizData = async () => {
    try {
      const randomQuizId = Math.floor(Math.random() * 30) + 1; // 1~30 사이의 퀴즈 ID 랜덤 생성
      const response = await fetchLevel1Quiz(randomQuizId);
      if (response.success) {
        setCurrentQuestion(response.data); // 퀴즈 데이터 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    loadQuizData(); // 컴포넌트가 마운트될 때 퀴즈 데이터 로드
  }, []);

  // 즐겨찾기 처리 함수
  const handleFavoriteClick = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
    setShowPopup(true); // 팝업 표시
  };

  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <Container className="game-level1-container">
      <div className="game-level1-left">
        <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>
        <div className="word-display">
          {currentQuestion ? (
            <div className="word-content">
              <span className="word-item">{currentQuestion.content}</span> {/* DB에서 불러온 단어 */}
              <div className="character-display">
                <span className="current-character">
                  현재 맞춰야 하는 지문자: {currentQuestion.detailed_content[0]} {/* 첫 번째 지문자 표시 */}
                </span>
              </div>
            </div>
          ) : (
            <span>Loading...</span> // 로딩 상태
          )}
        </div>
      </div>

      <div className="game-level1-right">
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="cam-placeholder">
          <h2 className="video-title">Live Video Feed</h2>
          <Webcam ref={webcamRef} className="video-feed" screenshotFormat="image/jpeg" />
        </div>
      </div>

      {showPopup && <PopupModal message={popupMessage} onClose={handleClosePopup} />}
    </Container>
  );
}

export default GameLevel1;
