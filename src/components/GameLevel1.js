import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchLevel1Quiz, toggleFavorite } from '../api'; // API 호출 함수 추가
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
  const [currentQuestion, setCurrentQuestion] = useState(null); // 퀴즈 데이터 상태
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [isLoading, setIsLoading] = useState(true);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0); // 지문자 인식 인덱스
  const [quizId, setQuizId] = useState(null); // quiz_id 상태
  const [mlIds, setMlIds] = useState([]); // ML 서버용 id 배열
  const [popupMessage, setPopupMessage] = useState(''); // 팝업 메시지 상태
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부 상태
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태

  const navigate = useNavigate();

  useEffect(() => {
    const randomQuizId = Math.floor(Math.random() * 30) + 1; // 1에서 30 사이의 랜덤 ID 생성
    loadQuizData(randomQuizId); // 랜덤하게 생성된 quizId로 데이터 로드
  }, []);

  const loadQuizData = async (quizId) => {
    try {
      const response = await fetchLevel1Quiz(quizId); // API 호출하여 데이터 가져오기
      if (response.success) {
        setCurrentQuestion(response.data); // 퀴즈 데이터 설정
        setQuizId(response.data.quiz_id); // quiz_id 설정
        setMlIds(response.data.id); // id 배열 설정 (ML 서버용)
        setIsFavorite(response.data.starred || false); // 즐겨찾기 상태 설정
        setIsLoading(false); // 로딩 상태 해제
        setCurrentCharacterIndex(0); // 첫 번째 지문자 인식 인덱스 초기화
        console.log("퀴즈 데이터 로드:", response.data);
      } else {
        console.error('퀴즈 데이터를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는 중 오류 발생:', error);
    }
  };

  // ML 서버로 지문자 ID 전송 함수
  const sendIdToMl = async (id) => {
    try {
      const response = await fetch('http://localhost:5000/finger_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }), // 지문자 ID를 ML 서버로 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // Flask로부터 받은 응답 로그
      setMlResult(result.result); // 0 또는 1의 결과 저장
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
    }
  };

  // 지문자 처리 함수
  const handleNextCharacter = async () => {
    const currentId = mlIds[currentCharacterIndex]; // 현재 지문자의 ID

    if (currentId) {
      await sendIdToMl(currentId); // 현재 지문자의 ID를 ML 서버로 전송
    }

    // 정답일 경우 다음 지문자로 이동
    if (mlResult === 1) {
      setCurrentCharacterIndex((prevIndex) => (prevIndex + 1) % mlIds.length); // 다음 지문자로 이동
    } else {
      // 오답일 경우 같은 지문자 유지
      console.log('오답입니다. 다시 시도하세요.');
    }
  };

  // 즐겨찾기 처리 함수: quiz_id를 사용
  const handleFavoriteClick = async () => {
    try {
      if (!quizId) {
        console.error('퀴즈 ID가 설정되지 않았습니다.');
        return;
      }

      const response = await toggleFavorite(quizId);
      if (response.success) {
        const newFavoriteState = !isFavorite;  // 즐겨찾기 상태 반전
        setIsFavorite(newFavoriteState);
        console.log('즐겨찾기 클릭 후 상태:', newFavoriteState);

        // 모달 메시지와 함께 팝업 표시
        if (newFavoriteState) {
          setPopupMessage('즐겨찾기에 등록되었습니다.');
        } else {
          setPopupMessage('즐겨찾기에서 해제되었습니다.');
        }
        setShowPopup(true); // 팝업 표시
      }
    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
    }
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
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <div className="word-content">
              <span className="word-item">{currentQuestion?.content}</span>
              <div className="character-display">
                <span className="current-character">
                  현재 맞춰야 하는 지문자: {currentQuestion?.detailed_content[currentCharacterIndex]}
                </span>
                <button onClick={handleNextCharacter}>다음 지문자</button>
              </div>
            </div>
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
          <img src="http://localhost:5000/video_feed" alt="Live Video Feed" className="video-feed" />
        </div>
      </div>

      {/* 팝업 모달 표시 */}
      {showPopup && (
        <PopupModal message={popupMessage} onClose={handleClosePopup} />
      )}
    </Container>
  );
}

export default GameLevel1;
