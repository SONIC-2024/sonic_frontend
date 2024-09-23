import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { loginUser, recoverPassword } from '../api'; // API 함수들 가져오기
import './Login.css';

Modal.setAppElement('#root');

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRecoverPasswordModalOpen, setIsRecoverPasswordModalOpen] = useState(false); // 비밀번호 찾기 모달 상태
  const [recoverEmail, setRecoverEmail] = useState(''); // 비밀번호 찾기용 이메일 상태
  const navigate = useNavigate();

  // 사용자가 저장한 이메일을 가져와서 기본값으로 설정
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail'); // 로컬 스토리지에서 이메일을 가져옴
    if (storedEmail) {
      setEmail(storedEmail); // 이메일 상태에 저장
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        alert('로그인 성공');
        navigate('/'); // 홈으로 이동
      } else {
        alert('로그인 실패: ' + response.message);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 문제가 발생했습니다.');
    }
  };

  const handleKakaoLogin = () => {
    const clientId = '8e3643a2c6410ddcc34494402ba6293d';  // 카카오 클라이언트 ID
    const redirectUri = 'http://localhost:3000/oauth';  // 로컬 리디렉트 URI로 수정
    window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  };  

  const openRecoverPasswordModal = () => {
    setIsRecoverPasswordModalOpen(true);
  };

  const closeRecoverPasswordModal = () => {
    setIsRecoverPasswordModalOpen(false);
    setRecoverEmail('');
  };

  const handleRecoverPassword = async () => {
    try {
      const response = await recoverPassword(recoverEmail);
      if (response.success) {
        alert('비밀번호 재설정 이메일이 발송되었습니다.');
        closeRecoverPasswordModal();
      } else {
        alert('비밀번호 재설정 요청 실패: ' + response.message);
      }
    } catch (error) {
      alert('비밀번호 재설정 중 오류가 발생했습니다.');
      console.error('비밀번호 재설정 오류:', error);
    }
  };

  return (
    <div className="login-modal">
      <h2>로그인</h2>
      <div className="input-container">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
      </div>
      <button onClick={handleLogin} className="general-login-button">일반 로그인</button>
      <button onClick={handleKakaoLogin} className="kakao-login-button">카카오 로그인</button>
      <button onClick={() => navigate('/register')} className="switch-button">회원가입으로 이동</button>
      <button onClick={openRecoverPasswordModal} className="switch-button">비밀번호 찾기</button>
      <button onClick={() => navigate('/')} className="close-button">닫기</button>

      {/* 비밀번호 찾기 모달 */}
      <Modal
        isOpen={isRecoverPasswordModalOpen}
        onRequestClose={closeRecoverPasswordModal}
        className="recover-password-modal"
        overlayClassName="overlay"
        contentLabel="비밀번호 찾기"
      >
        <div className="modal-content">
          <h2>비밀번호 찾기</h2>
          <p>비밀번호를 재설정할 이메일을 입력하세요.</p>
          <input
            type="email"
            value={recoverEmail}
            onChange={(e) => setRecoverEmail(e.target.value)}
            placeholder="이메일"
            className="modal-input"
          />
          <div className="modal-buttons">
            <button onClick={handleRecoverPassword} className="modal-button">
              전송
            </button>
            <button onClick={closeRecoverPasswordModal} className="modal-button cancel">
              취소
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Login;
