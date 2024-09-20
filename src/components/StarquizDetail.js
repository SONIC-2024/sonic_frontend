import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuizDetail } from '../api'; // API 함수 불러오기

function StarquizDetail() {
  const { level, quizId } = useParams(); // URL에서 레벨과 퀴즈 ID 가져옴
  const [quizDetail, setQuizDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuizDetail = async () => {
      setIsLoading(true);
      try {
        // 레벨별로 적절한 API 호출을 수행
        const response = await fetchQuizDetail(level, quizId); // level과 quizId를 사용해 퀴즈 데이터 불러오기
        setQuizDetail(response.data);
      } catch (error) {
        console.error('퀴즈 세부 정보를 불러오는 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizDetail();
  }, [level, quizId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!quizDetail) {
    return <p>퀴즈 정보를 불러올 수 없습니다.</p>;
  }

  return (
    <div>
      <h2>{quizDetail.title}</h2>
      <p>{quizDetail.description}</p>
      {/* 여기에 추가적으로 퀴즈 상세 내용 렌더링 */}
    </div>
  );
}

export default StarquizDetail;
