import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
  const webcamRef = useRef(null); // 웹캠에 대한 참조를 저장
  const [mlResult, setMlResult] = useState(null); // ML 서버로부터 받은 결과 저장

  // 캡처한 이미지를 ML 서버로 전송하는 함수
  const sendImageToMLServer = async (imageSrc) => {
    try {
      const response = await fetch('http://localhost:5000/finger_learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),  // 이미지를 JSON으로 전송
      });

      const result = await response.json();
      setMlResult(result.result); // 서버로부터 받은 결과를 상태에 저장
    } catch (error) {
      console.error('서버로 이미지 전송 중 오류 발생:', error);
    }
  };

  // 이미지를 캡처하는 함수
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    sendImageToMLServer(imageSrc); // 캡처된 이미지를 서버로 전송
  }, [webcamRef]);

  return (
    <div>
      {/* 웹캠 출력 */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
      />
      
      {/* 캡처 버튼 */}
      <button onClick={capture}>캡처 후 서버로 전송</button>
      
      {/* ML 결과 표시 */}
      {mlResult !== null && (
        <p>{mlResult === 1 ? '정답입니다!' : '오답입니다!'}</p>
      )}
    </div>
  );
};

export default WebcamCapture;
