import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './ConsonantDetail.css';

const consonantImages = [
  '/images/consonant1.png',
  '/images/consonant2.png',
  '/images/consonant3.png',
  '/images/consonant4.png',
  '/images/consonant5.png',
  '/images/consonant6.png',
  '/images/consonant7.png',
  '/images/consonant8.png',
  '/images/consonant9.png',
  '/images/consonant10.png',
  '/images/consonant11.png',
  '/images/consonant12.png',
  '/images/consonant13.png',
  '/images/consonant14.png',
  '/images/consonant15.png',
  '/images/consonant16.png',
  '/images/consonant17.png',
  '/images/consonant18.png',
  '/images/consonant19.png',
];

const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="consonant-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        <img src={consonantImages[index]} alt={`consonant${index + 1}`} className="consonant-detail-image" />
        <p className="consonant-character">{consonants[parseInt(index)]}</p>
      </div>
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default ConsonantDetail;
