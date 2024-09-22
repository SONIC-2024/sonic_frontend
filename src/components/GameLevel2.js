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
  const [quizId, setQuizId] = useState(null); // 퀴즈 ID
  const [options, setOptions] = useState([]); // 보기
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [score, setScore] = useState(0); // 점수
  const [questionCount, setQuestionCount] = useState(0); // 문제 개수
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 41) + 100; // 100에서 140 사이의 랜덤 ID 생성
    setQuizId(randomQuizId); // 랜덤하게 생성된 quizId 설정
    generateQuestion(randomQuizId); // 랜덤하게 생성된 quizId로 데이터 로드
  }, []);

  const generateQuestion = async (quizId) => {
    try {
      const response = await fetchLevel2Quiz(quizId); // API 호출
      console.log('fetchLevel2Quiz 응답:', response); // 응답 데이터 확인
  
      if (response) {
        setCurrentImage(response.objectUrl); // 이미지 URL 설정
        setCorrectAnswer(response.correctAnswer); // 정답 설정
        setOptions(response.options); // 4지선다 보기 설정

        // quiz_id가 설정되었는지 확인
        if (response.quiz_id) {
          setQuizId(response.quiz_id); // quiz_id가 설정된 경우 업데이트
        } else {
          console.error('퀴즈 ID가 설정되지 않았습니다.');
          return;
        }

        setIsFavorite(response.isStarred); // 즐겨찾기 상태 설정
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };  

  const handleOptionClick = async (option) => {
    if (option === correctAnswer) {
      setIsCorrect(true);
      setScore(score + 1);
      try {
        console.log('Sending quizId:', quizId, 'and correctAnswer:', correctAnswer); // 로그 추가
        // quizId와 correctAnswer를 함께 전달
        await handleQuizAnswer(quizId, correctAnswer); 
      } catch (error) {
        console.error('퀴즈 정답 처리 중 오류 발생:', error);
      }
    } else {
      setIsCorrect(false);
    }
    setQuestionCount(questionCount + 1);
    setModalIsOpen(true);
  };

  // 즐겨찾기 버튼 클릭 시 quiz_id를 즐겨찾기로 넘기는 함수
  const handleFavoriteClick = async () => {
    if (!quizId) {
      console.error('퀴즈 ID가 설정되지 않았습니다.');
      return; // quizId가 없는 경우 더 이상 처리하지 않음
    }

    try {
      console.log("즐겨찾기에 사용할 퀴즈 ID:", quizId);
      const response = await toggleFavorite(quizId); 
      if (response.success) {
        setIsFavorite(!isFavorite); // 즐겨찾기 상태 반전
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
