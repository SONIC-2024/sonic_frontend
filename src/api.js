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
    } else {
      console.error("토큰이 존재하지 않습니다. 로그인 상태를 확인하세요.");
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

// 단어 정보 불러오기 API
// API 호출 함수에서 로그 추가
export const fetchWordInfo = async (wordId) => {
  console.log(`Fetching word info with id: ${wordId}`); // 로그 추가
  try {
    const response = await apiClient.get(`/word?word-id=${wordId}`);
    console.log('API response:', response.data); // 응답 데이터 확인
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error('응답이 유효하지 않음');
    }
  } catch (error) {
    console.error('API 호출 중 오류:', error.response || error.message);
    handleError(error);
  }
};

// 자음 목록 불러오기 API
export const fetchConsonantsList = async (page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get('/word/list', {
      params: {
        category: 'c', // 자음 카테고리
        page,          // 페이지 번호
        size,          // 페이지 당 단어 수 (9개)
        sort           // 정렬 조건 (id 기준 오름차순)
      }
    });

    // API 응답 데이터 확인
    console.log('API 응답 데이터 (자음):', response.data);

    // 성공 여부와 데이터를 확인하여 반환
    if (response.data.success) {
      return response.data.data.content.map(item => ({
        id: item.id,
        title: item.title
      }));
    } else {
      throw new Error(response.data.message || '자음 목록을 불러오는 데 실패했습니다.');
    }

  } catch (error) {
    console.error('API 호출 중 오류 (자음):', error);
    handleError(error);
  }
};

// 모음 목록 불러오기 API
export const fetchVowelList = async (page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get('/word/list', {
      params: {
        category: 'v',  // 'v'는 모음 카테고리
        page,           // 페이지 번호
        size,           // 페이지 당 모음 수
        sort            // 정렬 조건 (id 기준 오름차순)
      }
    });

    console.log('모음 API 응답:', response.data);

    if (response.data.success) {
      return {
        vowels: response.data.data.content.map(item => ({
          id: item.id,
          title: item.title,
          objectUrl: item.objectUrl
        })),
        totalVowels: response.data.data.totalElements // 전체 모음 개수를 반환
      };
    } else {
      throw new Error(response.data.message || '모음 목록을 불러오는 데 실패했습니다.');
    }
  } catch (error) {
    console.error('모음 API 호출 중 오류:', error);
    handleError(error);
  }
};

// 단어 목록 불러오기 API
export const fetchCategoryList = async (category = 'w', page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get('/word/list', {
      params: {
        category,  // 'c', 'v', 'w' 중 하나 ('w' 사용)
        page,      // 페이지 번호
        size,      // 페이지 당 단어 수 (9개)
        sort       // 정렬 조건 (id 기준 오름차순)
      }
    });

    // API 응답 데이터 확인
    console.log('API 응답 데이터:', response.data);

    // 성공 여부와 데이터를 확인하여 반환
    if (response.data.success && Array.isArray(response.data.data.content)) {
      return response.data.data.content.map(item => ({
        id: item.id,
        title: item.title
      }));
    } else {
      throw new Error(response.data.message || '단어 목록을 불러오는 데 실패했습니다.');
    }

  } catch (error) {
    console.error('API 호출 중 오류:', error);
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

// AccessToken 가져오기 API
export const fetchAccessToken = async (code) => {
  try {
    const response = await apiClient.get(`/auth/sign-in/kakao`, { params: { code } });
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
    const response = await apiClient.get('/ranking', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // 토큰 추가
      },
    });
    console.log('Ranking API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    handleError(error);
  }
};

// 퀴즈 레벨1 불러오기 API
export const fetchLevel1Quiz = async (quizId) => {
  try {
    console.log(`Fetching Level 1 quiz with quizId: ${quizId}`); // 로그 추가
    const response = await apiClient.get(`/quiz/level-1?quiz-id=${quizId}`);
    console.log('퀴즈 레벨1 데이터:', response.data); // 응답 데이터 출력
    return response.data;
  } catch (error) {
    console.error('퀴즈 레벨1 데이터를 불러오는 중 오류:', error);
    throw error;
  }
};

// 퀴즈 레벨2 불러오기 API
export const fetchLevel2Quiz = async (quizId = 100) => {
  try {
    const url = `/quiz/level-2?quiz-id=${quizId}`; // quizId를 동적으로 경로에 넣음
    console.log(`Fetching Level 2 Quiz from URL: ${url}`); // URL 로그 추가

    const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
    };    

    const response = await apiClient.get(url); // 동적으로 생성된 URL을 사용해 API 호출

    if (response && response.data) {
      const quizData = response.data.data; // 응답에서 데이터 할당
      console.log('퀴즈 데이터:', quizData); // 퀴즈 데이터 구조 확인

      const correctAnswer = quizData.answer;
      const correctAnswerId = quizData.answerId; // 정답 ID 추가

      // `quizData.content`가 배열인지 확인하고 처리
      const contentArray = quizData.content;
      if (!Array.isArray(contentArray) || contentArray.length === 0) {
        console.error('contentArray가 비어 있습니다.');
        throw new Error('Invalid quiz data format: contentArray is empty.');
      }

      // 4지선다 문제 구성 (랜덤하게 보기 생성)
      const uniqueOptions = Array.from(new Set([...contentArray, correctAnswer])); // 중복 제거
      if (uniqueOptions.length < 4) {
        throw new Error('보기 옵션의 개수가 부족합니다.');
      }
      
      const options = shuffleArray(uniqueOptions).slice(0, 4); // 4개의 보기로 자르기

      return {
        objectUrl: quizData.objectUrl, // 이미지 URL
        options, // 4지선다 보기
        correctAnswer, // 정답
        correctAnswerId, // 정답 ID 추가
        isStarred: quizData.isStarred || false, // 즐겨찾기 여부
      };
    }
  } catch (error) {
    if (error.response) {
      console.error("API request failed:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response received from API:", error.request);
    } else {
      console.error("Error setting up API request:", error.message);
    }
    throw error;
  }
};

// 퀴즈 레벨3 불러오기 API
export const fetchLevel3Quiz = async (quizId = 200) => {
  try {
    const response = await apiClient.get(`/quiz/level-3?quiz-id=${quizId}`);
    console.log('퀴즈 레벨3 데이터:', response.data); // 콘솔에 데이터 출력
    return response.data;
  } catch (error) {
    console.error('퀴즈 레벨3 데이터를 불러오는 중 오류:', error);
    throw error;
  }
};

// 정답 처리 API
export const handleQuizAnswer = async (quizId, answer) => {
  try {
    // quizId와 answer를 요청 본문(body)으로 전달
    const response = await apiClient.post(`/quiz?quiz-id=${quizId}`, {
      quizId,   // quizId는 본문에 포함
      answer,   // 정답도 본문에 포함
    });
    console.log('정답 처리 응답:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status, 'data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// 즐겨찾기 등록 및 취소 API
export const toggleFavorite = async (quizId) => {
  try {
    const response = await apiClient.post(`/quiz/star?quiz-id=${quizId}`);
    console.log('즐겨찾기 응답:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status, 'data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// 즐겨찾기 등록 퀴즈 1
export const fetchFavoriteLevel1Quizzes = async (page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get(`/quiz/star/level-1`, {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('레벨 1 즐겨찾기 퀴즈를 불러오는 중 오류:', error);
    throw error;
  }
};

// 즐겨찾기 등록 퀴즈 2
export const fetchFavoriteLevel2Quizzes = async (page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get(`/quiz/star/level-2`, {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('레벨 2 즐겨찾기 퀴즈를 불러오는 중 오류:', error);
    throw error;
  }
};

// 즐겨찾기한 레벨 3 퀴즈 목록 불러오기
export const fetchFavoriteLevel3Quizzes = async (page = 0, size = 9, sort = 'id,asc') => {
  try {
    const response = await apiClient.get(`/quiz/star/level-3`, {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('레벨 3 즐겨찾기 퀴즈를 불러오는 중 오류:', error);
    throw error;
  }
};

// 레벨별 퀴즈 세부 정보 API 호출 함수
export const fetchQuizDetail = async (level, quizId) => {
  try {
    const response = await apiClient.get(`/quiz/level-${level}`, {
      params: { 'quiz-id': quizId } // 쿼리 파라미터로 quiz-id 전달
    });
    console.log(`Fetching quiz detail for quizId: ${quizId} in level: ${level}`);
    return response.data;
  } catch (error) {
    console.error('퀴즈 정보를 불러오는 중 오류:', error);
    throw error;
  }
};

// 공통 에러 처리 함수
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    console.error(`Error status: ${status}, data: ${JSON.stringify(data)}`);
  } else {
    console.error('Network error or no response:', error);
  }
};

// ML 서버와의 핸드모션 인식 API 호출 함수
export const recognizeHandMotion = async (mlIds) => {
  try {
    const response = await apiClient.post('/ml/recognize', { ids: mlIds });
    console.log('ML Recognition Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('ML 인식 중 오류 발생:', error);
    throw error;
  }
};
