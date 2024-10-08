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

        // 좌표를 콘솔에 찍어줌
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
    } catch (error) {
      console.error("ML 서버와의 통신 오류가 발생했습니다.", error);
    }
  };

  useEffect(() => {
    loadWordDetail();
    initializeHandpose();
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

export default WordDetail;
