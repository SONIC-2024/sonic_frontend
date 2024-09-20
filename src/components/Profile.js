import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import {
  handleDeleteAccount,
  changePassword,
  changeNickname,
  changeHandPreference,
  changeProfileImage,
  fetchTierInfo,
  fetchProfileInfo,
  fetchAttendance,
  fetchSolvedQuizNumbers,
  logoutUser,
  recoverPassword,
  reissueAccessToken,
} from '../api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

Modal.setAppElement('#root');

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/80');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRecoverPasswordModalOpen, setIsRecoverPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [handPreference, setHandPreference] = useState('');
  const [tierInfo, setTierInfo] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [solvedQuizNumbers, setSolvedQuizNumbers] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleApiError = useCallback(async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && data.code === 1000) {
        try {
          await reissueAccessToken();
          loadProfileData(); // 토큰 재발급 후 다시 시도
        } catch {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          handleLogout(); // 재발급 실패 시 로그아웃
        }
      } else if (status === 400) {
        alert(data.message);
      } else {
        console.error('API 오류 발생:', error);
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } else {
      console.error('오류 발생:', error);
      alert('알 수 없는 오류가 발생했습니다.');
    }
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      const tierData = await fetchTierInfo();
      setTierInfo(tierData.data);

      const profileData = await fetchProfileInfo();
      setProfileImage(profileData.data.profileImg);
      setNewNickname(profileData.data.nickname);

      const attendanceData = await fetchAttendance();
      setAttendance(attendanceData.data);

      const solvedQuizData = await fetchSolvedQuizNumbers();
      setSolvedQuizNumbers(solvedQuizData.data);
    } catch (error) {
      handleApiError(error);
    }
  }, [handleApiError]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      changeProfileImage(file)
        .then((response) => {
          console.log('프로필 사진 변경 성공:', response.message);
        })
        .catch((error) => {
          console.error('프로필 사진 변경 오류:', error);
        });
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPassword('');
  };

  const handleDeleteAccountClick = async () => {
    try {
      const response = await handleDeleteAccount(password);
      if (response.success) {
        alert('탈퇴되었습니다.');
        handleLogout(); // 계정 삭제 후 로그아웃
      } else {
        alert(response.message);
      }
      closeDeleteModal();
    } catch (error) {
      alert('회원 탈퇴 중 오류가 발생했습니다.');
      console.error('회원 탈퇴 오류:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        alert('로그아웃 성공');
        localStorage.removeItem('accessToken'); // 토큰 제거
        localStorage.removeItem('refreshToken'); // 리프레시 토큰 제거
        navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
      } else {
        alert('로그아웃 실패: ' + response.message);
      }
    } catch (error) {
      alert('로그아웃 중 오류가 발생했습니다.');
      console.error('로그아웃 오류:', error);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    changePassword(password, newPassword)
      .then((response) => {
        alert('비밀번호가 변경되었습니다.');
      })
      .catch((error) => {
        alert('비밀번호 변경 중 오류가 발생했습니다.');
        console.error('비밀번호 변경 오류:', error);
      });
  };

  const handleNicknameChange = () => {
    changeNickname(newNickname)
      .then((response) => {
        alert('닉네임이 변경되었습니다.');
      })
      .catch((error) => {
        alert('닉네임 변경 중 오류가 발생했습니다.');
        console.error('닉네임 변경 오류:', error);
      });
  };

  const handleHandChange = (hand) => {
    changeHandPreference(hand)
      .then((response) => {
        alert('손 방향이 변경되었습니다.');
        setHandPreference(hand);
      })
      .catch((error) => {
        alert('손 방향 변경 중 오류가 발생했습니다.');
        console.error('손 방향 변경 오류:', error);
      });
  };

  const openRecoverPasswordModal = () => {
    setIsRecoverPasswordModalOpen(true);
  };

  const closeRecoverPasswordModal = () => {
    setIsRecoverPasswordModalOpen(false);
    setEmail('');
  };

  const handleRecoverPassword = async () => {
    try {
      const response = await recoverPassword(email);
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

  const dayMap = {
    '월': 'mon',
    '화': 'tue',
    '수': 'wed',
    '목': 'thu',
    '금': 'fri',
    '토': 'sat',
    '일': 'sun',
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="logo">SONIC</div>
        <div className="profile-info">
          <img src={profileImage} alt="Profile" className="profile-pic" />
          <div className="user-info">
            <h2>{newNickname || '사용자'}</h2>
            <p className="status" onClick={handleLogout} style={{ cursor: 'pointer', color: 'blue' }}>로그아웃</p>
            <button className="edit-button" onClick={toggleEdit}>
              {isEditing ? '수정 완료' : '내 프로필 수정'}
            </button>
            <button className="edit-button" onClick={openRecoverPasswordModal}>
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="profile-edit-content">
          <div className="profile-edit-card">
            <h3>프로필 이미지 변경하기</h3>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="profile-edit-card">
            <label>
              이메일:
              <input type="email" value="seoyeonsong@naver.com" readOnly />
            </label>
            <div className="password-change">
              <label>
                비밀번호:
                <input
                  type="password"
                  placeholder="현재 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <button className="edit-button small" onClick={handlePasswordChange}>
                변경
              </button>
            </div>
            <div className="nickname-change">
              <label>
                닉네임:
                <input
                  type="text"
                  defaultValue={newNickname || '서연송'}
                  onChange={(e) => setNewNickname(e.target.value)}
                />
              </label>
              <button className="edit-button small" onClick={handleNicknameChange}>
                변경
              </button>
            </div>
            <div className="hand-change">
              <h4>손 방향 변경</h4>
              <button className="edit-button small" onClick={() => handleHandChange('right')}>
                오른손
              </button>
              <button className="edit-button small" onClick={() => handleHandChange('left')}>
                왼손
              </button>
            </div>
            <button className="withdrawal-button" onClick={openDeleteModal}>
              회원 탈퇴 하기
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-card">
            <h3>내 타이틀</h3>
            <div className="title-content">
              <div className="title-circle">{tierInfo ? tierInfo.tier : 'Loading...'}</div>
              <div className="title-info">
                <span>{tierInfo ? `상위 ${tierInfo.top}%` : 'Loading...'}</span>
                <span>{tierInfo ? `EXP ${tierInfo.exp}` : 'Loading...'}</span>
              </div>
            </div>
          </div>
          <div className="profile-card">
            <h3>내가 푼 문제</h3>
            <div className="problem-stats">
              <div className="total-problems">
                <p>총</p>
                <p>{solvedQuizNumbers ? `${solvedQuizNumbers.level1 + solvedQuizNumbers.level2 + solvedQuizNumbers.level3} 개` : 'Loading...'}</p>
              </div>
              <div className="level-stats">
                <p>Level 1: {solvedQuizNumbers ? `${solvedQuizNumbers.level1} 개` : 'Loading...'}</p>
                <p>Level 2: {solvedQuizNumbers ? `${solvedQuizNumbers.level2} 개` : 'Loading...'}</p>
                <p>Level 3: {solvedQuizNumbers ? `${solvedQuizNumbers.level3} 개` : 'Loading...'}</p>
              </div>
            </div>
          </div>
          <div className="profile-card wide">
        <button className="view-button" onClick={() => navigate('/starquiz')}>
          퀴즈 즐겨찾기
        </button>
      </div>
          <div className="profile-card wide">
            <h3>이번 주 출석</h3>
            <div className="attendance">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
                <div key={idx} className="day">
                  <p>{day}</p>
                  <div className={`circle ${attendance && attendance[dayMap[day]] ? 'filled' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card wide">
            <h3>최대 연속출석 일수</h3>
            <p className="streak">{attendance ? `${attendance.continuous} days` : 'Loading...'}</p>
          </div>
        </div>
      )}

      {/* 탈퇴 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        className="delete-modal"
        overlayClassName="overlay"
        contentLabel="회원 탈퇴 확인"
      >
        <div className="modal-content">
          <h2>회원 탈퇴</h2>
          <p>탈퇴하시려면 비밀번호를 입력하세요.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="modal-input"
          />
          <div className="modal-buttons">
            <button onClick={handleDeleteAccountClick} className="modal-button">
              확인
            </button>
            <button onClick={closeDeleteModal} className="modal-button cancel">
              취소
            </button>
          </div>
        </div>
      </Modal>

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

export default Profile;