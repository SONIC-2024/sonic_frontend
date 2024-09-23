import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import { fetchCategoryList } from '../api'; // API 함수 가져오기
import './Words.css';

function Words() {
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태
  const [words, setWords] = useState([]); // 단어 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate();
  const wordsPerPage = 9; // 페이지당 단어 수

  // 단어 목록 불러오기 함수, useCallback을 사용하여 의존성 문제 해결
  const loadWordList = useCallback(async () => {
    try {
      setLoading(true); // 로딩 시작
      const wordData = await fetchCategoryList('w', currentPage, wordsPerPage); // 페이지당 9개 단어 불러오기
      console.log('API 응답 데이터:', wordData); // 응답 데이터 확인
      if (wordData && wordData.data && wordData.data.content.length > 0) {
        setWords(wordData.data.content); // 단어 데이터를 상태에 저장
      } else {
        setWords([]); // 데이터를 받지 못했을 경우 빈 배열로 설정
      }
    } catch (error) {
      console.error('단어 목록을 가져오는 중 오류 발생:', error);
      setError('단어 목록을 가져오는 중 오류 발생'); // 에러 메시지 설정
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, [currentPage, wordsPerPage]);  

  // 컴포넌트 마운트될 때 단어 목록 불러오기
  useEffect(() => {
    loadWordList(); 
  }, [loadWordList]); // 의존성 배열에 loadWordList 포함

  // 이전 페이지로 이동
  const handleGoBack = () => {
    navigate(-1);
  };

  // 단어 클릭 시 상세 페이지로 이동
  const handleWordClick = (id) => {
    navigate(`/word-detail/${id}`); // 단어 ID로 상세 페이지로 이동
  };

  // 전체 페이지 수 계산
  const pages = Math.ceil(words.length / wordsPerPage); 
  // 현재 페이지에 표시할 단어들
  const currentWords = words.slice(
    currentPage * wordsPerPage,
    (currentPage + 1) * wordsPerPage
  );

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < pages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 이전 페이지로 이동
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 발생 시 표시할 내용
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="words-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>단어 배우기</h1>
      <div className="words-grid">
        {currentWords.length > 0 ? (
          currentWords.map((word) => (
            <button
              key={word.id}
              className="word-button"
              onClick={() => handleWordClick(word.id)} // 단어 클릭 시 ID 전달
            >
              {word.title} {/* 단어의 제목 표시 */}
            </button>
          ))
        ) : (
          <div>단어가 없습니다.</div> // 단어가 없을 때 표시할 내용
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
          disabled={currentPage === pages - 1}
        >
          <div className="triangle-right"></div>
        </button>
      </div>
    </Container>
  );
}

export default Words;
