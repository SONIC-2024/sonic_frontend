from flask import Flask, render_template, Response
from flask_cors import CORS
import cv2
import mediapipe as mp

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# 랜드마크는 55679C (BGR: 156, 67, 55), 연결선은 8294C4 (BGR: 196, 148, 130)으로 설정
drawing_spec_landmarks = mp_drawing.DrawingSpec(color=(196, 148, 130), thickness=3, circle_radius=3)
drawing_spec_connections = mp_drawing.DrawingSpec(color=(214, 177, 172), thickness=3)


def generate_frames():
    cap = cv2.VideoCapture(0)

    with mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5) as hands:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            result = hands.process(rgb_frame)

            if result.multi_hand_landmarks:
                for hand_landmarks in result.multi_hand_landmarks:
                    # landmark, connections 추가 
                    mp_drawing.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        drawing_spec_landmarks,
                        drawing_spec_connections)

                    # 손가락 관절 좌표 출력
                    for i, lm in enumerate(hand_landmarks.landmark):
                        h, w, _ = frame.shape
                        cx, cy = int(lm.x * w), int(lm.y * h)
                        print(f'관절 번호 {i}: ({cx}, {cy})')

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True, port=5001)
