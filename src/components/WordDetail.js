import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Container from '../styles/Container';
import { fetchWordInfo } from '../api';  // 기존 API 호출 함수
import './WordDetail.css';

function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null); // 웹캠 참조 추가
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태 추가
  const [attemptsLeft, setAttemptsLeft] = useState(3); // 남은 시도 횟수
  const [isChecking, setIsChecking] = useState(false); // 체크 중인지 상태
  const [checkInterval, setCheckInterval] = useState(null); // 반복 검사용 타이머

  useEffect(() => {
    if (id) {
      loadWord();
    }
    return () => clearInterval(checkInterval); // 컴포넌트가 언마운트되면 타이머 정리
  }, [id]);

  const loadWord = async () => {
    try {
      setLoading(true);
      const wordData = await fetchWordInfo(id);  // API 호출
      console.log('API 응답:', wordData);
      console.log('wordData 내용:', wordData.data); // data 부분만 확인
  
      if (wordData && wordData.success && wordData.data.content.length > 0) {
        const fetchedWord = wordData.data.content; // 단일 글자 대신 전체 content 사용
        console.log('받은 단어 정보:', fetchedWord);
        
        // 전체 단어를 그대로 표시
        setWord(fetchedWord);
      } else {
        setError('단어 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('단어 정보를 불러오는 중 오류 발생:', error);
      setError('단어 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };  
  
  // ML 서버로 단어와 웹캠 이미지를 전송하는 함수
  const sendWordToMl = async (word) => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot(); // 웹캠 이미지 캡처
      try {
        const response = await fetch('http://localhost:5000/body_learn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: word, image: imageSrc }),  // 단어와 이미지 전송
        });

        const result = await response.json();
        console.log('ML 서버 응답:', result);  // Flask로부터 받은 응답 로그
        return result.result; // 결과 반환 (0 또는 1)
      } catch (error) {
        console.error('ML 서버로 데이터 전송 중 오류 발생:', error);
        return null;
      }
    }
  };

  // ML 결과를 10초마다 확인하고, 3회 반복
  const startCheckingMlResult = (word) => {
    setIsChecking(true);
    setCheckInterval(
      setInterval(async () => {
        if (attemptsLeft > 0) {
          const result = await sendWordToMl(word); // ML 서버로 단어 전송 및 결과 수신
          setMlResult(result);
          setAttemptsLeft((prev) => prev - 1);
          if (result === 1 || attemptsLeft <= 1) {
            clearInterval(checkInterval); // 정답이 맞거나 시도가 끝나면 반복 중단
            setIsChecking(false);
          }
        }
      }, 10000) // 10초 간격으로 실행
    );
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="word-detail-container">
      <button className="back-button" onClick={handleGoBack}>&larr;</button>
      <div className="detail-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : word ? (
          <>
            <p className="word-text" style={{ fontSize: '64px', color: 'black', wordWrap: 'break-word', maxWidth: '80%' }}>
              {word}  {/* 여기서 제대로 단어가 출력되는지 추가 콘솔 로그 확인 */}
            </p>
            {console.log("단어 표시 중: ", word)}

            {/* ML 서버에서 받은 결과 표시 */}
            {mlResult !== null && (
              <p style={{ fontSize: '24px', color: mlResult === 1 ? 'green' : 'red' }}>
                {mlResult === 1 ? '정답입니다!' : '오답입니다!'}
              </p>
            )}
            {/* 남은 시도 횟수 표시 */}
            <p>남은 시도 횟수: {attemptsLeft}</p>
            {/* 버튼으로 ML 체크 시작 */}
          </>
        ) : (
          <p>단어 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <h2 className="video-title">Live Video Feed</h2>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
        />
      </div>
    </Container>
  );
}

export default WordDetail;
