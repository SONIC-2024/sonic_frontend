import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './Consonants.css';

const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];

function Consonants() {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleConsonantClick = (index) => {
    navigate(`/consonant-detail/${index}`);
  };

  const consonantsPerPage = 9;
  const pages = Math.ceil(consonants.length / consonantsPerPage);

  const currentConsonants = consonants.slice(
    currentPage * consonantsPerPage,
    (currentPage + 1) * consonantsPerPage
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
    <Container className="consonants-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>자음 배우기</h1>
      <div className="consonants-grid">
        {currentConsonants.map((consonant, index) => (
          <button
            key={index}
            className="consonant-button"
            onClick={() => handleConsonantClick(index + currentPage * consonantsPerPage)}
          >
            {consonant}
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

export default Consonants;
