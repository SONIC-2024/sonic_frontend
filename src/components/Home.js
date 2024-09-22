import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Container from '../styles/Container';
import { useNavigate } from 'react-router-dom';
import Ranking from './Ranking';
import { fetchAccessToken, fetchUserName, loginUser } from '../api'; // API 함수들 가져오기
import './Home.css';

Modal.setAppElement('#root');

function Home() {
  const [isLeftSectionOpen, setIsLeftSectionOpen] = useState(false);
  const [isRightSectionOpen, setIsRightSectionOpen] = useState(false);
  const [isCenterSectionOpen, setIsCenterSectionOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [rankingModalOpen, setRankingModalOpen] = useState(false); // 랭킹 모달 상태
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('470dc7bf73bd968fd704a3afec689397'); // REST API 키
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleLogin(code); // 인가 코드로 로그인 처리
    } else {
      const token = localStorage.getItem('accessToken');
      if (token) {
        getUserName(); // 로그인된 사용자가 있으면 사용자 이름 가져오기
      }
    }
  }, []);

  const handleLogin = async (code) => {
    try {
      const response = await fetchAccessToken(code);  // 인가 코드를 이용해 액세스 토큰 요청
      if (response && response.success) {
        navigate('/');
      } else {
        console.error('로그인 실패:', response?.message);
        navigate('/');
      }
    } catch (error) {
      console.error('로그인 처리 중 오류 발생:', error);
      navigate('/');
    }
  };    

  const handleKakaoLogin = () => {
    const clientId = '8e3643a2c6410ddcc34494402ba6293d';  // 카카오 REST API 키
    const redirectUri = 'http://localhost:3000/oauth';  // 리디렉트 URI
    window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  };  

  const handleGeneralLogin = async () => {
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        await getUserName();
        closeModal();
      } else {
        console.error('로그인 실패:', response.message);
        alert('일반 로그인에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('일반 로그인 중 오류 발생:', error);
      alert('일반 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const getUserName = async () => {
    try {
      const response = await fetchUserName();
      if (response.success && response.data.authenticated) {
        setUserName(response.data.name);
      } else {
        setUserName('');
      }
    } catch (error) {
      console.error('사용자 이름 가져오기 실패:', error);
      setUserName('');
    }
  };

  const handleLeftSectionToggle = () => {
    setIsLeftSectionOpen(!isLeftSectionOpen);
  };

  const handleRightSectionToggle = () => {
    setIsRightSectionOpen(!isRightSectionOpen);
  };

  const handleCenterSectionToggle = () => {
    setIsCenterSectionOpen(!isCenterSectionOpen);
  };

  const handleConsonantClick = () => {
    navigate('/consonants');
  };

  const handleVowelClick = () => {
    navigate('/vowels');
  };

  const handleWordClick = () => {
    navigate('/words');
  };

  const handleLetsGoClick = () => {
    if (!userName) {
      setModalIsOpen(true);
    } else {
      handleCenterSectionToggle();
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleLevelClick = (level) => {
    navigate(`/game-level${level}`);
  };

  const handleDashboardClick = () => {
    setRankingModalOpen(true);
    closeModal();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    closeModal();
  };

  const toggleRankingModal = () => {
    setRankingModalOpen(!rankingModalOpen);
  };

  return (
    <Container className="home-container">
      <div className={`home-section left-section ${isLeftSectionOpen ? 'open' : ''}`}>
        <div className="button-container">
          {isLeftSectionOpen && (
            <div className="toggle-content">
              <button className="toggle-button" onClick={handleConsonantClick}>
                자음
              </button>
              <button className="toggle-button" onClick={handleVowelClick}>
                모음
              </button>
              <button className="toggle-button" onClick={handleWordClick}>
                단어
              </button>
            </div>
          )}
          <button className="home-button" onClick={handleLeftSectionToggle}>
            따라하며 배우기
          </button>
        </div>
      </div>
      <div className="home-section center-section">
        {isCenterSectionOpen && userName && (
          <div className="toggle-content above">
            <button className="home-ranking-button" onClick={handleDashboardClick}>랭킹</button>
            <button className="home-profile-button" onClick={handleProfileClick}>마이페이지</button>
          </div>
        )}
        <button className="home-button center-button" onClick={handleLetsGoClick}>
          {userName ? `${userName}님` : "Let's go"}
        </button>
      </div>
      <div className={`home-section right-section ${isRightSectionOpen ? 'open' : ''}`}>
        <div className="button-container">
          {isRightSectionOpen && (
            <div className="toggle-content">
              <button className="level-button" onClick={() => handleLevelClick(1)}>Level 1</button>
              <button className="level-button" onClick={() => handleLevelClick(2)}>Level 2</button>
              <button className="level-button" onClick={() => handleLevelClick(3)}>Level 3</button>
            </div>
          )}
          <button className="home-button" onClick={handleRightSectionToggle}>
            퀴즈
          </button>
        </div>
      </div>

      {/* 로그인 모달 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="modal-content">
          <h2>로그인</h2>
          {isLoginMode ? (
            <>
              <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleGeneralLogin} className="general-login-button">일반 로그인</button>
              <button onClick={handleKakaoLogin} className="kakao-login-button">카카오 로그인</button>
              <button onClick={() => setIsLoginMode(false)} className="switch-button">회원가입으로 이동</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/register')} className="switch-button">회원가입 페이지로 이동</button>
              <button onClick={() => setIsLoginMode(true)} className="switch-button">로그인으로 이동</button>
            </>
          )}
          <button onClick={closeModal} className="close-button">닫기</button>
        </div>
      </Modal>

      {/* 랭킹 모달 */}
      <Modal
        isOpen={rankingModalOpen}
        onRequestClose={toggleRankingModal}
        contentLabel="Ranking Modal"
        className="ranking-modal"
        overlayClassName="overlay"
      >
       <button onClick={toggleRankingModal} className="close-modal-button">×</button> {/* X 버튼으로 변경 */}
         <div className="ranking-modal-content">
         <Ranking isOpen={rankingModalOpen} toggleRankingModal={toggleRankingModal} />
        </div>
      </Modal>
    </Container>
  );
}

export default Home;
