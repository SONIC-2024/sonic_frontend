import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchQuizDetail } from '../api'; // API 함수 불러오기
import './StarquizDetail.css';

function StarquizDetail() {
  const { level, quizId } = useParams(); // URL에서 레벨과 퀴즈 ID 가져옴
  const [quizDetail, setQuizDetail] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null); // 현재 질문 상태 추가
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0); // 현재 문자 인덱스 추가
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 오류 상태 추가
  const navigate = useNavigate(); // navigate 함수 사용

  useEffect(() => {
    const loadQuizDetail = async () => {
      try {
        const response = await fetchQuizDetail(level, quizId);
        console.log('API 응답:', response.data);  // 콘솔에 전체 API 응답 구조 확인
        
        // 레벨 1에 한해 quiz_id가 30 이하인 경우만 데이터를 설정
        if (level === '1') {
          if (response.data.quiz_id <= 30) {
            setQuizDetail(response.data);
            setCurrentQuestion(response.data); // currentQuestion에 퀴즈 데이터를 설정
          } else {
            setError('해당 퀴즈는 레벨 1의 범위에 맞지 않습니다.'); // quiz_id가 30 이상일 경우
          }
        } else {
          setQuizDetail(response.data); // 다른 레벨에 대해서는 필터링 없이 설정
          setCurrentQuestion(response.data);
        }
      } catch (error) {
        console.error('퀴즈 정보를 불러오는 중 오류:', error);
        setError('퀴즈 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuizDetail();
  }, [level, quizId]);

  const handleGoBack = () => {
    navigate(`/starquiz`); // Starquiz 페이지로 돌아가기
  };

  return (
    <Container className="starquiz-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : quizDetail ? (
          <>
            <p className="quiz-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
              {quizDetail.content ? quizDetail.content : "No Content Available"} {/* content 사용 */}
            </p>
            {level === '1' && (
              <p className="current-character" style={{ fontSize: '48px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                현재 맞춰야 하는 지문자: {currentQuestion?.detailed_content?.[currentCharacterIndex] || "No Character Available"} {/* 지문자 표시 */}
              </p>
            )}
          </>
        ) : (
          <p>퀴즈 정보를 불러올 수 없습니다.</p>
        )}
      </div>
  
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );   
}

export default StarquizDetail;
