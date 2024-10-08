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
      // WebGL 백엔드 사용 설정
      await tf.setBackend("webgl");
      await tf.ready(); // TensorFlow.js 백엔드 준비

      // Handpose 모델 로드
      const net = await handpose.load();
      console.log("Handpose 모델 로드 완료");

      const detect = async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video;
          const predictions = await net.estimateHands(video);

          if (predictions.length > 0) {
            drawHands(predictions);

            // 손 관절 좌표를 콘솔에 찍어줌
            console.log("손 관절 데이터:", predictions[0].landmarks);
            
            // 서버로 손 관절 좌표 전송
            await sendToMLServer(predictions[0].landmarks);
          } else {
            console.log("손 관절을 감지하지 못했습니다.");
          }
        } else {
          console.log("웹캠이 준비되지 않았습니다.");
        }
        requestAnimationFrame(detect); // 실시간으로 프레임마다 호출
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

        // 좌표를 콘솔에 찍어줌
        console.log(`관절 ${i}: x=${x}, y=${y}`);

        ctx.beginPath();
        ctx.arc(x * videoWidth, y * videoHeight, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      });
    });
  };

  // ML 서버로 손 관절 좌표를 보내는 함수
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
    } catch (error) {
      console.error("ML 서버와의 통신 오류가 발생했습니다.", error);
    }
  };

  // 초기 데이터 로드 및 Handpose 모델 초기화
  useEffect(() => {
    loadConsonantDetail();
    initializeHandpose();
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
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="video-feed" />
        <canvas ref={canvasRef} className="canvas" />
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)}>닫기</button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ConsonantDetail;
