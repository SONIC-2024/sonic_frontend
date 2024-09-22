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
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태
  const navigate = useNavigate(); // navigate 함수 사용

  useEffect(() => {
    const loadQuizDetail = async () => {
      try {
        const response = await fetchQuizDetail(level, quizId);
        console.log('API 응답:', response.data);  // 콘솔에 전체 API 응답 구조 확인

        if (response.data.quiz_id <= 30 || level !== '1') {
          setQuizDetail(response.data);
          setCurrentQuestion(response.data);
        } else {
          setError('해당 퀴즈는 레벨 1의 범위에 맞지 않습니다.');
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

  // ML 서버로 데이터 전송 함수 (레벨에 따라 다르게 설정)
  const sendIdToMl = async (id) => {
    const apiEndpoint = level === '1' ? 'finger_quiz' : 'body_quiz'; // 레벨에 따라 다른 엔드포인트 사용
    try {
      const response = await fetch(`http://localhost:5000/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }), // 레벨에 맞는 ID 전송
      });

      const result = await response.json();
      console.log('ML 서버 응답:', result);  // Flask로부터 받은 응답 로그
      setMlResult(result.result); // 결과 저장 (0 또는 1)
    } catch (error) {
      console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
    }
  };

  const handleGoBack = () => {
    navigate(`/starquiz`); // Starquiz 페이지로 돌아가기
  };

  const handleNextCharacter = () => {
    const nextIndex = (currentCharacterIndex + 1) % currentQuestion?.detailed_content?.length;
    setCurrentCharacterIndex(nextIndex);

    // 다음 지문자 ID를 ML 서버로 전송
    const idToSend = currentQuestion?.id[nextIndex];
    if (idToSend) {
      sendIdToMl(idToSend); // 선택한 지문자 ID를 ML 서버로 전송
    }
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
            {/* 레벨 3에서 지문자 없이 퀴즈 텍스트만 표시 */}
            {level === '3' && (
              <p className="quiz-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                {quizDetail.content ? quizDetail.content : "No Content Available"} {/* content 사용 */}
              </p>
            )}

            {/* 레벨 1에서 지문자 표시 및 처리 */}
            {level === '1' && (
              <>
                <p className="quiz-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                  {quizDetail.content ? quizDetail.content : "No Content Available"} {/* content 사용 */}
                </p>
                <p className="current-character" style={{ fontSize: '48px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
                  현재 맞춰야 하는 지문자: {currentQuestion?.detailed_content?.[currentCharacterIndex] || "No Character Available"} {/* 지문자 표시 */}
                </p>
                {/* ML 서버 결과 표시 */}
                {mlResult !== null && (
                  <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                    {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
                  </p>
                )}
                <button onClick={handleNextCharacter}>다음 문자</button>
              </>
            )}
          </>
        ) : (
          <p>퀴즈 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5000/video_feed_body" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default StarquizDetail;
