import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchVowelList } from '../api'; // 모음 목록을 가져오는 API 함수 추가
import './Vowels.css';

function Vowels() {
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [vowels, setVowels] = useState([]); // 현재 페이지의 모음 데이터
  const [totalVowels, setTotalVowels] = useState(0); // 전체 모음 수
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate();
  const vowelsPerPage = 9; // 페이지당 모음 수

  // 모음 목록 불러오기 함수
  const loadVowels = async () => {
    try {
      setLoading(true);
      const data = await fetchVowelList(currentPage, vowelsPerPage); // 페이지별 모음 목록을 불러옴
      console.log('Fetched Vowels:', data.vowels); // 받아온 데이터 확인용 로그
      setVowels(data.vowels); // 받아온 모음 데이터를 상태에 저장
      setTotalVowels(data.totalVowels); // 전체 모음 개수 설정
    } catch (error) {
      setError('모음 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVowels(); // currentPage가 변경될 때마다 모음 목록을 새로 불러옴
  }, [currentPage]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleVowelClick = (id) => {
    navigate(`/vowel-detail/${id}`); // 모음 클릭 시 상세 페이지로 이동
  };

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalVowels / vowelsPerPage);

  console.log('Total Vowels:', totalVowels);
  console.log('Current Page Vowels:', vowels); // 현재 페이지에 있는 모음 확인용 로그

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1); // 다음 페이지로 이동
      console.log('Next Page:', currentPage + 1); // 다음 페이지 로그 확인
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1); // 이전 페이지로 이동
      console.log('Previous Page:', currentPage - 1); // 이전 페이지 로그 확인
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="vowels-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>모음 배우기</h1>
      <div className="vowels-grid">
        {vowels.length > 0 ? (
          vowels.map((vowel) => (
            <button
              key={vowel.id}
              className="vowel-button"
              onClick={() => handleVowelClick(vowel.id)} // ID를 기반으로 상세 페이지로 이동
            >
              {vowel.title} {/* 모음의 제목 표시 */}
            </button>
          ))
        ) : (
          <div>모음이 없습니다.</div>
        )}
      </div>
      <div className="pagination-buttons">
        <button
          className="nav-arrow"
          onClick={handlePreviousPage}
          disabled={currentPage === 0} // 첫 페이지에서는 이전 버튼 비활성화
        >
          <div className="triangle-left"></div>
        </button>
        <button
          className="nav-arrow"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1} // 마지막 페이지에서는 다음 버튼 비활성화
        >
          <div className="triangle-right"></div>
        </button>
      </div>
    </Container>
  );
}

export default Vowels;
