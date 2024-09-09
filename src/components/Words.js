import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './Words.css';

const words = [
  '나비', '고슴도치', '기타', '소방서', '마우스', '컴퓨터', 
  '여름', '다과', '의자', '귀신', '계절', '차도',
  '드라마', '어린이', '피아노', '하품', '키위', '타조', '사과', '도서관',
  '고양이', '레몬', '우유', '그물', '터널', '예방', '규칙',
  '상자', '애벌레'
];

function Words() {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleWordClick = (index) => {
    navigate(`/word-detail/${index}`);
  };

  const wordsPerPage = 9;
  const pages = Math.ceil(words.length / wordsPerPage);

  const currentWords = words.slice(
    currentPage * wordsPerPage,
    (currentPage + 1) * wordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < pages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container className="words-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>단어 배우기</h1>
      <div className="words-grid">
        {currentWords.map((word, index) => (
          <button
            key={index}
            className="word-button"
            onClick={() => handleWordClick(index + currentPage * wordsPerPage)}
          >
            {word}
          </button>
        ))}
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
