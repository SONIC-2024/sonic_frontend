import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../styles/Container';
import Button from '../styles/Button';
import './Signup.css';

function Signup() {
  return (
    <Container className="signup-container">
      <div className="signup-form">
        <h2>회원가입</h2>
        <input type="text" placeholder="아이디" className="input-field" />
        <input type="email" placeholder="이메일" className="input-field" />
        <input type="password" placeholder="비밀번호" className="input-field" />
        <input type="password" placeholder="비밀번호 확인" className="input-field" />
        <Button className="signup-button">회원가입</Button>
        <Link to="/login" className="login-link">로그인</Link>
      </div>
    </Container>
  );
}

export default Signup;
