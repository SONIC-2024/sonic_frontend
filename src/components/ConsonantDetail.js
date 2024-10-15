import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Container from "../styles/Container";
import { fetchWordInfo } from "../api";
import "./ConsonantDetail.css";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

function ConsonantDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [consonant, setConsonant] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

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
      await tf.setBackend("webgl");
      await tf.ready();
      const net = await handpose.load();

      const detect = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video);

          if (predictions.length > 0) {
            drawHands(predictions);
            console.log("손 관절 데이터:", predictions[0].landmarks);
            await sendToMLServer(predictions[0].landmarks);
          } else {
            console.log("손 관절을 감지하지 못했습니다.");
          }
        }
        requestAnimationFrame(detect); // 실시간 감지
      };
      detect();
    } catch (error) {
      console.error("Handpose 모델 초기화 중 오류 발생:", error);
    }
  }, []);

  // 손 관절 시각화 함수
  const drawHands = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    predictions.forEach((prediction) => {
      prediction.landmarks.forEach((landmark, i) => {
        const [x, y] = landmark;
        console.log(`관절 ${i}: x=${x}, y=${y}`);
        ctx.beginPath();
        ctx.arc(x * videoWidth, y * videoHeight, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      });
    });
  };

  // 서버로 손 관절 좌표를 전송하는 함수
  const sendToMLServer = async (landmarks) => {
    try {
      const response = await fetch("http://localhost:5000/finger_learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: index, landmarks }),
      });
      const data = await response.json();
      setPopupMessage(data.result > 0 ? "정답입니다!" : "오답입니다!");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000); // 3초 후 팝업 닫기
    } catch (error) {
      console.error("ML 서버와의 통신 오류가 발생했습니다.", error);
    }
  };

  // 7초마다 랜덤으로 정답 또는 오답 팝업을 출력하는 함수
  const displayRandomPopup = () => {
    const randomResult = Math.random() > 0.5 ? "정답입니다!" : "오답입니다!";
    setPopupMessage(randomResult);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // 3초 후 팝업 닫기
  };

  useEffect(() => {
    loadConsonantDetail();
    initializeHandpose();

    // 6초마다 팝업 출력
    const timer = setInterval(displayRandomPopup, 6000);

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, [loadConsonantDetail, initializeHandpose]);

  const handleGoBack = () => {
    navigate("/consonants");
  };

  return (
    <Container className="consonant-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {consonant ? (
          <div className="image-container">
            <p className="consonant-character">{consonant.content}</p>
            <img
              src={`/images/Consonant${index}.gif`}
              alt={`Consonant ${index}`}
              className="large-image"
              onError={(e) => {
                e.target.src = "/images/default.gif";
              }}
            />
            <img
              src={`/images/consonant${index}.png`}
              alt={`Consonant ${index}`}
              className="small-image"
              onError={(e) => {
                e.target.src = "/images/default.png";
              }}
            />
          </div>
        ) : (
          <p>자음 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
          style={{ width: "100%", height: "100%" }} // 화면 절반을 꽉 채우도록 설정
        />
        <canvas
          ref={canvasRef}
          className="canvas"
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }} // 캔버스도 카메라와 동일한 크기로 설정
        />
      </div>

      {showPopup && (
        <div className="popup" style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          zIndex: 1000
        }}>
          <div className="popup-content">
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ConsonantDetail;
