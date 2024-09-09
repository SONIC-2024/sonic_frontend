import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, sendEmailVerificationCode } from '../api'; // API 함수들 가져오기
import './Register.css'; // 스타일 파일 추가

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const [hand, setHand] = useState('right'); // 기본값을 오른손으로 설정
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  const handleSendEmailCode = async () => {
    try {
      const response = await sendEmailVerificationCode(email);
      if (response.success) {
        setEmailSent(true);
        alert('인증 코드가 이메일로 전송되었습니다.');
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('이메일 코드 전송 오류:', error);
      alert('이메일 전송에 실패했습니다. 이메일주소를 확인해 주세요.');
    }
  };

  const handleRegister = async () => {
    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      const response = await registerUser(email, password, nickname, hand, passwordCheck, verificationCode);
      if (response.success) {
        alert('회원가입이 완료되었습니다.');
        navigate('/login'); // 로그인 페이지로 이동
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      <div className="form-group">
        <label>이메일:</label>
        <div className="email-verification">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={handleSendEmailCode} className="btn">인증 코드 보내기</button>
        </div>
      </div>
      {emailSent && (
        <div className="form-group">
          <label>인증 코드:</label>
          <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
        </div>
      )}
      <div className="form-group">
        <label>비밀번호:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="form-group">
        <label>비밀번호 확인:</label>
        <input type="password" value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} />
      </div>
      <div className="form-group">
        <label>닉네임:</label>
        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>
      <div className="form-group">
        <label>사용할 손:</label>
        <select value={hand} onChange={(e) => setHand(e.target.value)}>
          <option value="right">오른손</option>
          <option value="left">왼손</option>
        </select>
      </div>
      <button onClick={handleRegister} className="btn primary">회원가입</button>
    </div>
  );
}

export default Register;
