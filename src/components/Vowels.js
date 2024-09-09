import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './Vowels.css';

const vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅚ', 'ㅟ', 'ㅢ', 'ㅘ', 'ㅙ', 'ㅝ', 'ㅞ'];

function Vowels() {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleVowelClick = (index) => {
    navigate(`/vowel-detail/${index}`);
  };

  const vowelsPerPage = 9;
  const pages = Math.ceil(vowels.length / vowelsPerPage);

  const currentVowels = vowels.slice(
    currentPage * vowelsPerPage,
    (currentPage + 1) * vowelsPerPage
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
    <Container className="vowels-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>모음 배우기</h1>
      <div className="vowels-grid">
        {currentVowels.map((vowel, index) => (
          <button
            key={index}
            className="vowel-button"
            onClick={() => handleVowelClick(index + currentPage * vowelsPerPage)}
          >
            {vowel}
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

export default Vowels;
