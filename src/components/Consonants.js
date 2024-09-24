import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchCategoryList } from '../api'; // 자음 목록을 가져오는 API 함수 추가
import './Consonants.css';

function Consonants() {
  const [currentPage, setCurrentPage] = useState(0);
  const [consonants, setConsonants] = useState([]); // 자음을 API로 불러온 데이터를 저장할 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const consonantsPerPage = 9; // 페이지당 자음 수 (9개로 설정)

  // 자음 목록 불러오기 함수
  const loadConsonants = async () => {
    try {
      setLoading(true);
      const data = await fetchCategoryList('c', 0, 14); // 'c' 카테고리를 통해 자음 목록을 한 번에 모두 불러옴
      if (data && data.length > 0) {
        setConsonants(data); // 데이터가 존재하면 상태에 저장
      } else {
        setError('자음 데이터를 찾을 수 없습니다.'); // 데이터가 없을 경우 에러 처리
      }
    } catch (error) {
      setError('자음 목록을 불러오는 중 오류가 발생했습니다.'); // API 호출 실패 시 에러 처리
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  };  

  useEffect(() => {
    loadConsonants(); // 컴포넌트가 마운트될 때 자음 목록을 불러옴
  }, []);

  const handleGoBack = () => {
    navigate("/");
  };

  const handleConsonantClick = (id) => {
    navigate(`/consonant-detail/${id}`); // 자음 클릭 시 상세 페이지로 이동
  };

  // 페이지 계산: 자음이 총 14개이므로 9개씩 2페이지로 나눔
  const totalPages = Math.ceil(consonants.length / consonantsPerPage);

  // 현재 페이지에 해당하는 자음들만 표시
  const currentConsonants = consonants.slice(
    currentPage * consonantsPerPage,
    (currentPage + 1) * consonantsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="consonants-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>자음 배우기</h1>
      <div className="consonants-grid">
        {currentConsonants.length > 0 ? (
          currentConsonants.map((consonant, index) => (
            <button
              key={index}
              className="consonant-button"
              onClick={() => handleConsonantClick(consonant.id)}
            >
              {consonant.title} {/* 자음의 제목 표시 */}
            </button>
          ))
        ) : (
          <div>자음이 없습니다.</div>
        )}
      </div>
      <div className="pagination-buttons">
        <button
          className="nav-arrow"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          <div className="triangle-left"></div>
        </button>
        <button
          className="nav-arrow"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <div className="triangle-right"></div>
        </button>
      </div>
    </Container>
  );
}

export default Consonants;
