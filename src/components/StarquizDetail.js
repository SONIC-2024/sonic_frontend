import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizDetail } from '../api'; // API 함수 불러오기

function StarquizDetail() {
  const { level, quizId } = useParams(); // URL에서 레벨과 퀴즈 ID 가져옴
  const [quizDetail, setQuizDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 오류 상태 추가
  const navigate = useNavigate(); // navigate 함수 사용

  useEffect(() => {
    const loadQuizDetail = async () => {
      setIsLoading(true);
      setError(null);  // 새로운 요청 전에 오류 초기화
      try {
        console.log(`Fetching quiz detail for quizId: ${quizId}`);  // quizId 로그 추가
        const response = await fetchQuizDetail(quizId);  // API 호출
        console.log('Response from server:', response);  // 서버 응답 로그
        setQuizDetail(response.data);
      } catch (error) {
        console.error('퀴즈 세부 정보를 불러오는 중 오류:', error);
        setError('퀴즈 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadQuizDetail();
  }, [quizId]);

  const handleGoBack = () => {
    navigate(`/starquiz`); // Starquiz 페이지로 돌아가기
  };

  const handleGoToLevel = () => {
    // level에 따라 학습 화면으로 분기
    if (level === '1') {
      console.log('Navigating to game-level1 with quizId:', quizId); // 로그 추가
      navigate(`/game-level1/${quizId}`); // 레벨 1 학습 화면으로 이동
    } else if (level === '2') {
      navigate(`/game-level2/${quizId}`); // 레벨 2 학습 화면으로 이동
    } else if (level === '3') {
      navigate(`/game-level3/${quizId}`); // 레벨 3 학습 화면으로 이동
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleGoBack}>돌아가기</button>
      </div>
    );
  }

  if (!quizDetail) {
    return (
      <div>
        <p>퀴즈 정보를 불러올 수 없습니다.</p>
        <button onClick={handleGoBack}>돌아가기</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{quizDetail.title}</h2>
      <p>{quizDetail.description}</p>
      <button onClick={handleGoToLevel}>학습 화면으로 이동</button> {/* 레벨에 따라 학습 화면으로 이동 */}
      <button onClick={handleGoBack}>즐겨찾기 목록으로 돌아가기</button>
    </div>
  );
}

export default StarquizDetail;
