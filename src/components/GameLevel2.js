import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel2Quiz, toggleFavorite } from '../api';
import './GameLevel2.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

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

function GameLevel2() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [options, setOptions] = useState([]); // 보기
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부

  const navigate = useNavigate();
  
  const gifImages = [
    { id: 100, gif: '/images/Quiz_id100.gif', png: '/images/quiz_id100.png' },
    { id: 101, gif: '/images/Quiz_id101.gif', png: '/images/quiz_id101.png' },
    { id: 102, gif: '/images/Quiz_id102.gif', png: '/images/quiz_id102.png' }
  ];

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const randomQuizId = Math.floor(Math.random() * 41) + 100;
        const response = await fetchLevel2Quiz(randomQuizId);
        if (response) {
          setCurrentQuestion(response);
          setIsFavorite(response.isStarred);
          setOptions(response.options); // 보기 항목 설정
        }
      } catch (error) {
        console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    loadQuizData(); // 컴포넌트가 마운트될 때 퀴즈 데이터 로드
  }, []);

  const handleOptionClick = (option) => {
    if (option === currentQuestion.correctAnswer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setModalIsOpen(true); // 모달 열기
  };

  const handleFavoriteClick = async () => {
    try {
      const response = await toggleFavorite(currentQuestion?.quiz_id);
      if (response.success) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        setPopupMessage(newFavoriteState ? '즐겨찾기에 등록되었습니다.' : '즐겨찾기에서 해제되었습니다.');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류 발생:', error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    const randomQuizId = Math.floor(Math.random() * 41) + 100; // 다음 퀴즈도 랜덤하게 설정
    setCurrentQuestion(null);
    fetchLevel2Quiz(randomQuizId).then((response) => {
      setCurrentQuestion(response);
    });
  };

  const randomGif = gifImages[Math.floor(Math.random() * gifImages.length)];

  return (
    <Container className="game-level2-container">
      <div className="game-level2-left">
        {currentQuestion ? (
          <>
            <h2>{currentQuestion.content}</h2>
            <div className="image-container">
              <img src={randomGif.gif} alt={`Quiz ${randomGif.id}`} className="large-image" />
              <img src={randomGif.png} alt={`Quiz ${randomGif.id}`} className="small-image" />
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="game-level2-right">
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        <div className="options">
          {options.map((option, index) => (
            <button key={index} className="option-button" onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {showPopup && <PopupModal message={popupMessage} onClose={handleClosePopup} />}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Result Modal"
        className="result-modal"
        overlayClassName="result-overlay"
      >
        <div className="modal-content">
          <h2 className={isCorrect ? 'correct-icon' : 'wrong-icon'}>
            {isCorrect ? 'O' : 'X'}
          </h2>
          <p>{isCorrect ? '정답입니다!' : '오답입니다!'}</p>
          <button onClick={handleCloseModal} className="next-button">다음</button>
        </div>
      </Modal>
    </Container>
  );
}

export default GameLevel2;
