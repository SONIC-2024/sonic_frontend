import React from 'react';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAccessToken } from '../api';  // API 함수 가져오기

function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');  // 인가 코드 가져오기

    if (code) {
      handleLogin(code);
    } else {
      console.error('인가 코드가 없습니다.');
      navigate('/');  // 에러 발생 시 홈으로 리디렉션
    }
  }, []);

  const handleLogin = async (code) => {
    try {
      const response = await fetchAccessToken(code);  // 인가 코드를 이용해 액세스 토큰 요청
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);  // 액세스 토큰 저장
        localStorage.setItem('refreshToken', response.data.refreshToken);  // 리프레시 토큰 저장
        navigate('/profile');  // 성공하면 프로필 페이지로 리디렉션
      } else {
        console.error('로그인 실패:', response.message);
        navigate('/');  // 실패 시 홈으로 리디렉션
      }
    } catch (error) {
      console.error('로그인 처리 중 오류 발생:', error);
      navigate('/');  // 오류 발생 시 홈으로 리디렉션
    }
  };

  return <div>카카오 로그인 처리 중...</div>;
}

export default OAuthCallback;
