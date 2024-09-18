import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../styles/Container';
import './VowelDetail.css';

const vowelImages = [
  '/images/vowels1.png',
  '/images/vowels2.png',
  '/images/vowels3.png',
  '/images/vowels4.png',
  '/images/vowels5.png',
  '/images/vowels6.png',
  '/images/vowels7.png',
  '/images/vowels8.png',
  '/images/vowels9.png',
  '/images/vowels10.png',
  '/images/vowels11.png',
  '/images/vowels12.png',
  '/images/vowels13.png',
  '/images/vowels14.png',
  '/images/vowels15.png',
  '/images/vowels16.png',
  '/images/vowels17.png',
  '/images/vowels18.png',
  '/images/vowels19.png',
  '/images/vowels20.png',
  '/images/vowels21.png',
  '/images/vowels22.png',
  '/images/vowels23.png',
];

const vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅚ', 'ㅟ', 'ㅢ', 'ㅘ', 'ㅙ', 'ㅝ', 'ㅞ'];

function VowelDetail() {
  const { index } = useParams();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="vowel-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        <img src={vowelImages[index]} alt={`vowel${index + 1}`} className="vowel-detail-image" />
        <p className="vowel-character">{vowels[index]}</p>
      </div>
      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <img src="http://localhost:5001/video_feed" alt="Live Video Feed" className="video-feed" />
      </div>
    </Container>
  );
}

export default VowelDetail;
