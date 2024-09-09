import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './Training.css';

function Training() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleConsonantsClick = () => navigate('/consonants');
  const handleVowelsClick = () => navigate('/vowels');
  const handleWordsClick = () => navigate('/words');

  return (
    <Container className="training-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <h1>따라하며 배우기</h1>
      <div className="training-buttons">
        <button className="training-button" onClick={handleConsonantsClick}>자음</button>
        <button className="training-button" onClick={handleVowelsClick}>모음</button>
        <button className="training-button" onClick={handleWordsClick}>단어</button>
      </div>
    </Container>
  );
}

export default Training;
