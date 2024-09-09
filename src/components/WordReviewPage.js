import React, { useState, useEffect } from 'react';
import { fetchWordInfo } from '../api'; // 단어 정보 가져오는 API 함수
import Container from '../styles/Container';
import './WordReviewPage.css';

function WordReviewPage() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    loadWordData();
  }, []);

  const loadWordData = async () => {
    try {
      const response = await fetchWordInfo();
      if (response.success) {
        setWords(response.data); // API에서 받은 단어 데이터 설정
      } else {
        console.error('단어 정보를 불러오는 데 실패했습니다:', response.message);
      }
    } catch (error) {
      console.error('단어 정보를 불러오는 중 오류 발생:', error);
    }
  };

  return (
    <Container className="word-review-container">
      <h1>단어 다시 보기</h1>
      <div className="grid-container">
        {words.length > 0 ? (
          words.map((word, index) => (
            <div key={index} className="grid-item">
              <span>{word.title}</span>
            </div>
          ))
        ) : (
          <p>단어를 불러올 수 없습니다.</p>
        )}
      </div>
    </Container>
  );
}

export default WordReviewPage;
