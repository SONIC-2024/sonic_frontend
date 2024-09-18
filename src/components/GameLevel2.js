import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Modal from 'react-modal';
import Container from '../styles/Container';
import { fetchLevel2Quiz, handleQuizAnswer, toggleFavorite } from '../api'; 
import './GameLevel2.css';

Modal.setAppElement('#root');

function GameLevel2() {
  const [currentImage, setCurrentImage] = useState(''); // 이미지 URL
  const [correctAnswer, setCorrectAnswer] = useState(''); // 정답
  const [options, setOptions] = useState([]); // 보기
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [score, setScore] = useState(0); // 점수
  const [questionCount, setQuestionCount] = useState(0); // 문제 개수
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태

  const navigate = useNavigate();

  useEffect(() => {
    generateQuestion(); // 첫 번째 문제 로드
  }, []);

  const generateQuestion = async () => {
    try {
      const randomQuizId = 100; // 100번만 호출 (임시)
      const response = await fetchLevel2Quiz(randomQuizId); // API 호출
      console.log('fetchLevel2Quiz 응답:', response); // 응답 데이터 확인
  
      if (response) {
        setCurrentImage(response.objectUrl); // 이미지 URL 설정
        setCorrectAnswer(response.correctAnswer); // 정답 설정
        setOptions(response.options); // 4지선다 보기 설정
        setIsFavorite(response.isStarred); // 즐겨찾기 상태 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다.'); // response가 없을 때 에러 처리
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error); // 오류 메시지 출력
    }
  };  

  const handleOptionClick = async (option) => {
    if (option === correctAnswer) {
      setIsCorrect(true);
      setScore(score + 1);
      try {
        await handleQuizAnswer(correctAnswer); // 정답 처리 API 호출
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
    try {
      await toggleFavorite(100); // 100번 퀴즈 ID로 즐겨찾기 토글
      setIsFavorite(!isFavorite); // 즐겨찾기 상태 변경
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    if (questionCount >= 10) {
      navigate('/'); // 10문제를 완료한 경우 홈으로 이동
    } else {
      generateQuestion(); // 다음 문제로 이동
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="game-level2-container">
      <div className="game-level2-left">
        <button className="back-button" onClick={handleGoBack}>&larr;</button>
        {currentImage && (
          <img src={currentImage} alt="Character" className="character-image" />
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
    </Container>
  );
}

export default GameLevel2;