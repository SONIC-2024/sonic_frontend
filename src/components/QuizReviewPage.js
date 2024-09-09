import React, { useState, useEffect } from 'react';
import { fetchSolvedQuizNumbers } from '../api'; // 문제 정보 가져오는 API 함수
import Container from '../styles/Container';
import './QuizReviewPage.css';

function QuizReviewPage() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      const response = await fetchSolvedQuizNumbers();
      if (response.success) {
        setQuizzes(response.data); // API에서 받은 문제 데이터 설정
      } else {
        console.error('문제 정보를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('문제 정보를 불러오는 중 오류 발생:', error);
    }
  };

  return (
    <Container className="quiz-review-container">
      <h1>문제 다시 보기</h1>
      <div className="grid-container">
        {quizzes.length > 0 ? (
          quizzes.map((quiz, index) => (
            <div key={index} className="grid-item">
              <span>{quiz.title}</span>
            </div>
          ))
        ) : (
          <p>문제를 불러올 수 없습니다.</p>
        )}
      </div>
    </Container>
  );
}

export default QuizReviewPage;
