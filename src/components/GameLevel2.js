import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Container from '../styles/Container';
import { fetchLevel2Quiz, handleQuizAnswer, toggleFavorite } from '../api';
import './GameLevel2.css';

Modal.setAppElement('#root');

// PopupModal 컴포넌트 추가
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
  const [currentImagePng, setCurrentImagePng] = useState(''); // PNG 이미지 URL
  const [currentImageGif, setCurrentImageGif] = useState(''); // GIF 이미지 URL
  const [correctAnswer, setCorrectAnswer] = useState(''); // 정답
  const [quizId, setQuizId] = useState(null); // 퀴즈 ID
  const [options, setOptions] = useState([]); // 보기
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [score, setScore] = useState(0); // 점수
  const [questionCount, setQuestionCount] = useState(0); // 문제 개수
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [popupMessage, setPopupMessage] = useState(''); // 팝업 메시지
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 41) + 100; // 100에서 140 사이의 랜덤 ID 생성
    setQuizId(randomQuizId); // 랜덤하게 생성된 quizId 설정
    generateQuestion(randomQuizId); // 랜덤하게 생성된 quizId로 데이터 로드
  }, []);

  // 정답 이미지 파일 로드 로직
  const loadImages = (quizId) => {
    const pngUrl = `/images/quiz_id@${quizId}.png`; // PNG 이미지 경로
    const gifUrl = `/images/Quiz_id@${quizId}.gif`; // GIF 이미지 경로

    // PNG 로드
    const pngImage = new Image();
    pngImage.src = pngUrl;
    pngImage.onload = () => setCurrentImagePng(pngUrl);  // PNG가 로드되면 상태 설정
    pngImage.onerror = () => setCurrentImagePng('');  // PNG가 없을 경우 빈 문자열 설정

    // GIF 로드
    const gifImage = new Image();
    gifImage.src = gifUrl;
    gifImage.onload = () => setCurrentImageGif(gifUrl);  // GIF가 로드되면 상태 설정
    gifImage.onerror = () => setCurrentImageGif('');  // GIF가 없을 경우 빈 문자열 설정
  };

  // 문제 생성 함수
  const generateQuestion = async (quizId) => {
    try {
      const response = await fetchLevel2Quiz(quizId); // 여기서 fetchLevel2Quiz만 호출하면 됩니다.
      console.log('fetchLevel2Quiz 응답:', response); // 응답 데이터 확인

      if (response) {
        setCorrectAnswer(response.correctAnswer); // 정답 설정
        setQuizId(response.quiz_id || quizId); // quiz_id가 있으면 설정, 없으면 기존 quizId 유지
        setIsFavorite(response.isStarred); // 즐겨찾기 상태 설정
        setOptions([...response.options]); // 보기 설정

        // 이미지 로드 함수 호출
        loadImages(quizId);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // 4지선다 문제를 렌더링하는 부분
  const handleOptionClick = async (option) => {
    if (option === correctAnswer) {
      setIsCorrect(true);
      setScore(score + 1);
      try {
        await handleQuizAnswer(quizId, correctAnswer); // quizId와 정답을 함께 전달
      } catch (error) {
        console.error('퀴즈 정답 처리 중 오류 발생:', error);
      }
    } else {
      setIsCorrect(false);
    }
    setQuestionCount(questionCount + 1);
    setModalIsOpen(true);
  };

  const handleFavoriteClick = async () => {
    if (!quizId) {
      console.error('퀴즈 ID가 설정되지 않았습니다.');
      return; // quizId가 없는 경우 더 이상 처리하지 않음
    }

    try {
      const response = await toggleFavorite(quizId); 
      if (response.success) {
        setIsFavorite(!isFavorite); // 즐겨찾기 상태 반전

        // 팝업 메시지 설정
        const message = isFavorite ? '즐겨찾기에서 해제되었습니다.' : '즐겨찾기에 등록되었습니다.';
        setPopupMessage(message);  // 팝업 메시지 업데이트
        setShowPopup(true);  // 팝업 표시
        setTimeout(() => setShowPopup(false), 2000);  // 2초 후 팝업 숨기기
      }
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    if (questionCount >= 10) {
      navigate('/'); // 10문제를 완료한 경우 홈으로 이동
    } else {
      const randomQuizId = Math.floor(Math.random() * 41) + 100; // 다음 퀴즈도 랜덤하게 설정
      setQuizId(randomQuizId);
      generateQuestion(randomQuizId); // 다음 문제로 이동
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="game-level2-container">
      <div className="game-level2-left">
        <button className="back-button" onClick={handleGoBack}>&larr;</button>
        {currentImagePng && (
          <img src={currentImagePng} alt="PNG Character" className="character-image" />
        )}
        {currentImageGif && (
          <img src={currentImageGif} alt="GIF Character" className="character-image" />
        )}
      </div>
      <div className="game-level2-right">
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`} 
          onClick={handleFavoriteClick}
        >
          ★
        </button>
        {options.length > 0 ? (
          options.map((option, index) => (
            <button key={index} className="option-button" onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))
        ) : (
          <p>Loading options...</p>
        )}
        <p className="progress-indicator">{score}/10</p>
      </div>
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

      {/* 팝업 모달 표시 */}
      {showPopup && (
        <PopupModal message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </Container>
  );
}

export default GameLevel2;
