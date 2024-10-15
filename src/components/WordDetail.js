import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Container from "../styles/Container";
import { fetchWordInfo } from "../api";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "./WordDetail.css";

function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [word, setWord] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const loadWordDetail = useCallback(async () => {
    try {
      const response = await fetchWordInfo(id);
      if (response && response.success) {
        setWord(response.data.content);
      }
    } catch (error) {
      console.error("단어 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }, [id]);

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
        requestAnimationFrame(detect);
      };
      detect();
    } catch (error) {
      console.error("Handpose 모델 초기화 중 오류 발생:", error);
    }
  }, []);

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

  const sendToMLServer = async (landmarks) => {
    try {
      const response = await fetch("http://localhost:5000/finger_learn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, landmarks }),
      });
      const data = await response.json();
      setPopupMessage(data.result > 0 ? "정답입니다!" : "오답입니다!");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000); // 3초 후 팝업 닫기
    } catch (error) {
      console.error("ML 서버와의 통신 오류가 발생했습니다.", error);
    }
  };

  const displayRandomPopup = () => {
    const randomResult = Math.random() > 0.5 ? "정답입니다!" : "오답입니다!";
    setPopupMessage(randomResult);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // 3초 후 팝업 닫기
  };

  useEffect(() => {
    loadWordDetail();
    initializeHandpose();

    const timer = setInterval(displayRandomPopup, 10000); // 10초마다 팝업 출력

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, [loadWordDetail, initializeHandpose]);

  const handleGoBack = () => {
    navigate("/words");
  };

  return (
    <Container className="word-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <span className="back-arrow">&larr;</span>
      </button>

      <div className="detail-content">
        {word ? (
          <div>
            <p className="word-text">{word}</p>
          </div>
        ) : (
          <p>단어 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="cam-placeholder">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="video-feed"
          style={{ width: "100%", height: "100%" }}
        />
        <canvas
          ref={canvasRef}
          className="canvas"
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
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

export default WordDetail;
