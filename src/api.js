import axios from 'axios';

// Base URL 설정
const API_BASE_URL = 'http://43.201.210.243:8080';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 인터셉터로 공통 헤더 설정 및 에러 처리
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 토큰 만료 시 재발급 및 요청 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await reissueAccessToken(); // 토큰 재발급 시도
        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        return apiClient(originalRequest); // 재시도
      } catch (tokenError) {
        await logoutUser(); // 재발급 실패 시 로그아웃 처리
      }
    }
    return Promise.reject(error);
  }
);

// 액세스 토큰 재발급 API
export const reissueAccessToken = async () => {
  try {
    const response = await apiClient.post('/auth/reissue', {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    });

    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } else {
      console.error('토큰 재발급 실패:', response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error('토큰 재발급 중 오류 발생:', error);
    throw error;
  }
};

// 자음/모음/단어 목록 불러오기 API
export const fetchCategoryList = async (category) => {
  try {
    const response = await apiClient.get(`/items?category=${category}&size=9&sort=true`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 회원가입 API
export const registerUser = async (email, password, nickname, hand, passwordCheck, emailCode) => {
  try {
    const response = await apiClient.post('/auth/sign-up', {
      email, password, nickname, hand, passwordCheck, emailCode,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 이메일 인증 코드 발송 API
export const sendEmailVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/auth/send-mail', { email });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 일반 로그인 API
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/sign-in/general', { email, password });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 프로필 사진 변경 API
export const changeProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.patch('/member/profile-img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 닉네임 변경 API
export const changeNickname = async (nickname) => {
  try {
    const response = await apiClient.patch('/member/nickname', { nickname });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 비밀번호 찾기 API
export const recoverPassword = async (email) => {
  try {
    const response = await apiClient.patch('/auth/password', { email });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 비밀번호 재설정 API (비밀번호 찾기 후)
export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await apiClient.patch('/auth/password', { resetToken, newPassword });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 비밀번호 변경 API (로그인 후)
export const changePassword = async (password, newPassword) => {
  try {
    const response = await apiClient.patch('/member/password', { password, newPassword });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 손 방향 변경 API
export const changeHandPreference = async (hand) => {
  try {
    const response = await apiClient.patch('/member/hand', { hand });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 로그아웃 API
export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/log-out');
    if (response.data.success) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('로그아웃 성공:', response.data.message);
    } else {
      console.error('로그아웃 실패:', response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    throw error;
  }
};

// 회원 탈퇴 API
export const handleDeleteAccount = async (password) => {
  try {
    const response = await apiClient.delete('/member', {
      data: { password },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 티어 정보 불러오기 API
export const fetchTierInfo = async () => {
  try {
    const response = await apiClient.get('/learning/tier');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 문제 개수 불러오기 API
export const fetchSolvedQuizNumbers = async () => {
  try {
    const response = await apiClient.get('/learning/solved-quiz');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 출석 일수 불러오기 API
export const fetchAttendance = async () => {
  try {
    const response = await apiClient.get('/learning/attendance');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 프로필 정보 불러오기 API
export const fetchProfileInfo = async () => {
  try {
    const response = await apiClient.get('/member/profile');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 단어 정보 불러오기 API
export const fetchWordInfo = async (wordId) => {
  try {
    const response = await apiClient.get(`/word?word-id=${wordId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// AccessToken 가져오기 API
export const fetchAccessToken = async (code) => {
  try {
    const response = await apiClient.post('/auth/sign-in/kakao', { code });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 사용자 이름 가져오기 API
export const fetchUserName = async () => {
  try {
    const response = await apiClient.get('/member');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 랭킹 데이터 가져오기 API
export const fetchRankingData = async () => {
  try {
    const response = await apiClient.get('/ranking');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 퀴즈 레벨1 불러오기 API
export const fetchLevel1Quiz = async () => {
  try {
    const response = await apiClient.get('/quiz/level-1?quiz-id=1');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 퀴즈 레벨2 불러오기 API
export const fetchLevel2Quiz = async () => {
  try {
    const response = await apiClient.get('/quiz/level-2?quiz-id=20');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 퀴즈 레벨3 불러오기 API
export const fetchLevel3Quiz = async () => {
  try {
    const response = await apiClient.get('/quiz/level-3?quiz-id=30');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 즐겨찾기 등록 및 취소 API
export const toggleFavorite = async (itemId) => {
  try {
    const response = await apiClient.post(`/quiz?star&quiz-id=1`, { id: itemId });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 퀴즈 정답 처리 API
export const handleQuizAnswer = async (quizId) => {
  try {
    const response = await apiClient.post(`/quiz?quiz-id=1`, { id: quizId });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 공통 에러 처리 함수
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        console.error('잘못된 요청: ', data.message);
        break;
      case 401:
        console.error('인증 실패: ', data.message);
        break;
      case 404:
        console.error('잘못된 경로 요청: ', data.message);
        break;
      case 500:
        console.error('서버 오류: ', data.message);
        break;
      default:
        console.error('알 수 없는 오류: ', data.message);
    }
  } else {
    console.error('요청 중 오류 발생:', error);
  }

  throw error.response ? error.response.data : error;
};
