import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Modal from 'react-modal';
import Container from '../styles/Container';
import { fetchLevel2Quiz, handleQuizAnswer, toggleFavorite } from '../api'; 
import './GameLevel2.css';

Modal.setAppElement('#root');

function GameLevel2() {
  const [currentImage, setCurrentImage] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    try {
      const response = await fetchLevel2Quiz();
      console.log('API 응답:', response); // 응답을 콘솔에 출력하여 구조를 확인
      if (response && response.success) {
        setCurrentImage(response.data.objectUrl); // 이미지 URL 설정
        setCorrectAnswer(response.data.answer); // 정답 설정
        setOptions(shuffleArray(response.data.content)); // 선택지 설정
        setIsFavorite(response.data.isFavorite || false); // 즐겨찾기 상태 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response?.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleOptionClick = async (option) => {
    if (option === correctAnswer) {
      setIsCorrect(true);
      setScore(score + 1);
      try {
        await handleQuizAnswer(correctAnswer);
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
      await toggleFavorite(currentImage.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('즐겨찾기 상태 변경 중 오류 발생:', error);
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    if (questionCount >= 10) {
      navigate('/');
    } else {
      generateQuestion();
    }
  };

  const handleGoBack = () => {
    window.history.back();
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
