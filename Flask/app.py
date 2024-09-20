from flask import Flask, render_template, Response, jsonify
import cv2
import mediapipe as mp
from finger_spelling.finger_stream import gen_frames  
from real_time_inference import real_time_inference  

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/predict', methods=['POST'])
def predict():
    # 실시간으로 유사도를 반환하는 함수 호출
    similarity, predicted_class = real_time_inference()

    # JSON 형식으로 예측된 클래스와 유사도를 반환
    return jsonify({
        'predicted_class': predicted_class,
        'similarity': similarity
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)