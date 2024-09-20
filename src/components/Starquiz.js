import React, { useState, useEffect } from 'react';
import {
  fetchFavoriteLevel1Quizzes,
  fetchFavoriteLevel2Quizzes,
  fetchFavoriteLevel3Quizzes,
} from '../api'; // 각 레벨에 맞는 즐겨찾기 퀴즈 API 호출
import './Starquiz.css';
import { useNavigate } from 'react-router-dom';

function Starquiz() {
  const [favoriteQuizzes, setFavoriteQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState(1); // 현재 선택된 레벨 상태
  const navigate = useNavigate();

  const loadFavoriteQuizzes = async (level) => {
    setIsLoading(true); // 로딩 상태 시작
    try {
      let response;
      if (level === 1) {
        response = await fetchFavoriteLevel1Quizzes();
      } else if (level === 2) {
        response = await fetchFavoriteLevel2Quizzes();
      } else if (level === 3) {
        response = await fetchFavoriteLevel3Quizzes();
      }
      setFavoriteQuizzes(response.data.content); // 해당 레벨의 퀴즈 상태 저장
    } catch (error) {
      console.error('즐겨찾기 퀴즈를 불러오는 중 오류:', error);
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  const handleLevelChange = (level) => {
    setActiveLevel(level);
    loadFavoriteQuizzes(level); // 해당 레벨의 퀴즈를 불러옴
  };

  const handleQuizClick = (quizId) => {
    navigate(`/starquizdetail/${activeLevel}/${quizId}`); // 레벨과 퀴즈 ID를 함께 보냄
  };  

  return (
    <div className="starquiz-container">
      <h2>즐겨찾기한 퀴즈 목록</h2>
      <div className="level-buttons">
        <button
          className={`level-button ${activeLevel === 1 ? 'active' : ''}`}
          onClick={() => handleLevelChange(1)}
        >
          Level 1
        </button>
        <button
          className={`level-button ${activeLevel === 2 ? 'active' : ''}`}
          onClick={() => handleLevelChange(2)}
        >
          Level 2
        </button>
        <button
          className={`level-button ${activeLevel === 3 ? 'active' : ''}`}
          onClick={() => handleLevelChange(3)}
        >
          Level 3
        </button>
      </div>

      {isLoading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <ul className="quiz-list">
          {favoriteQuizzes.length > 0 ? (
            favoriteQuizzes.map((quiz) => (
              <li key={quiz.id} className="quiz-item" onClick={() => handleQuizClick(quiz.id)}>
                {quiz.title}
              </li>
            ))
          ) : (
            <p className="loading-text">즐겨찾기한 퀴즈가 없습니다.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default Starquiz;
