import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Container from "../styles/Container";
import { fetchWordInfo } from "../api";
import "./ConsonantDetail.css";
import * as handpose from "@tensorflow-models/handpose"; // 손 관절 모델
import * as tf from "@tensorflow/tfjs"; // TensorFlow.js 객체 가져오기
import "@tensorflow/tfjs-backend-webgl"; // WebGL 백엔드 추가
import "@tensorflow/tfjs-backend-wasm"; // WASM 백엔드 추가

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // 캔버스 레퍼런스 추가
  const [consonant, setConsonant] = useState(null);
  const [mlResult, setMlResult] = useState(null); // ML 서버 결과 상태
  const [popupMessage, setPopupMessage] = useState(""); // 팝업 메시지 상태
  const [showPopup, setShowPopup] = useState(false); // 팝업창 표시 여부

  // 자음 정보를 불러오는 함수
  const loadConsonantDetail = useCallback(async () => {
    try {
      const response = await fetchWordInfo(index);
      if (response && response.success) {
        setConsonant(response.data);
      }
    } catch (error) {
      console.error("자음 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }, [index]);

  // Handpose 모델 초기화 함수
  const initializeHandpose = useCallback(async () => {
    try {
      await tf.setBackend("webgl"); // 또는 'wasm'을 사용할 수 있습니다.
      await tf.ready(); // 백엔드 준비 완료
      console.log("TensorFlow.js 백엔드 로드 완료:", tf.getBackend());

      const net = await handpose.load(); // handpose 모델 로드
      console.log("Handpose model loaded.");

      const detect = async () => {
        const startTime = Date.now();
        let collectedResults = []; // 2초간의 결과 수집 배열

        const intervalId = setInterval(async () => {
          if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const predictions = await net.estimateHands(video); // 손 관절 예측
            if (predictions.length > 0) {
              drawHands(predictions); // 손 관절 시각화
              const result = await sendToMLServer(predictions[0].landmarks);
              collectedResults.push(result);
            }
          }

          // 5초 후 평균 계산
          if (Date.now() - startTime >= 5000) {
            clearInterval(intervalId);
            const avgResult = collectedResults.reduce((a, b) => a + b, 0) / collectedResults.length;

            if (avgResult > 0) {
              setPopupMessage("훌륭합니다. 다음 수어로 넘어갑시다."); // 정답일 경우 팝업 메시지
              setMlResult(true);
            } else {
              setPopupMessage("오답입니다.");
              setMlResult(false);
            }
            setShowPopup(true); // 팝업창 표시
          }
        }, 1000); // 매 1000ms마다 프레임 추적
      };

      detect();
    } catch (error) {
      console.error("Handpose 모델 초기화 중 오류 발생:", error);
    }
  }, []);

  // 캔버스에 손 관절 시각화 함수
  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    predictions.forEach((prediction) => {
      prediction.landmarks.forEach((landmark) => {
        const { x, y } = landmark;
        ctx.beginPath();
        ctx.arc(x * videoWidth, y * videoHeight, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      });
    });
  };

  // ML 서버로 데이터 전송 함수
  const sendToMLServer = async (landmarks) => {
    try {
      const response = await fetch("http://localhost:5000/finger_learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: index, landmarks }), // 손 관절 데이터를 전송
      });
      const data = await response.json();
      return data.result; // 결과 반환 (0 또는 1)
    } catch (error) {
      console.error("ML 서버와의 통신 오류가 발생했습니다.", error);
      return 0; // 오류 시 0 반환 (오답 처리)
    }
  };

  // 화면 렌더링 시 자음 정보 및 Handpose 모델 로드
  useEffect(() => {
    loadConsonantDetail();
    initializeHandpose();
  }, [loadConsonantDetail, initializeHandpose]);

  const handleGoBack = () => {
    navigate("/consonants");
  };

  const handleClosePopup = () => {
    setShowPopup(false); // 팝업창 닫기
    if (mlResult) {
      navigate("/consonants"); // 정답일 경우 Consonant.js로 돌아가기
    }
  };

  return (
    <Container className="consonant-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {consonant ? (
          <>
            <div className="image-container">
              <p className="consonant-character">{consonant.content}</p>
              <img
                src={`/images/Consonant${index}.gif`}
                alt={`Consonant ${index} Large`}
                className="large-image"
                onError={(e) => {
                  e.target.src = "/images/default.gif";
                }}
              />
              <img
                src={`/images/consonant${index}.png`}
                alt={`Consonant ${index} Small`}
                className="small-image"
                onError={(e) => {
                  e.target.src = "/images/default.png";
                }}
              />
            </div>
          </>
        ) : (
          <p>자음 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
          mirrored={false}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={handleClosePopup}>닫기</button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ConsonantDetail;
