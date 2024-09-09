import React, { useEffect, useState } from 'react';
import Modal from 'react-modal'; // 모달 사용을 위한 import
import { fetchRankingData } from '../api'; 
import './Ranking.css';

// 모달의 루트 요소를 설정합니다.
Modal.setAppElement('#root');

function Ranking({ isOpen, toggleRankingModal }) {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) { // 모달이 열릴 때만 데이터를 로드
      const loadRankingData = async () => {
        try {
          const data = await fetchRankingData();
          if (data.success) {
            setRankingData(data.data);
          } else {
            setError('랭킹 데이터를 불러오는 중 오류가 발생했습니다.');
          }
        } catch (err) {
          setError('랭킹 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };

      loadRankingData();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={toggleRankingModal}
      className="ranking-modal"
      overlayClassName="ranking-overlay"
    >
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="ranking-container">
          <div className="ranking-header">
            <h2>랭킹</h2>
            <button onClick={toggleRankingModal} className="close-modal-button">닫기</button>
          </div>
          <div className="ranking-modal-content">
            <ul className="ranking-list">
              {rankingData.map((user, index) => (
                <li key={user.id} className="ranking-item">
                  <div className="ranking-rank">#{user.ranking}</div>
                  <img src={user.tierImg} alt="Tier" className="tier-image" />
                  <img src={user.profileImg} alt="Profile" className="profile-image" />
                  <div className="user-info">
                    <div className="nickname">{user.nickname}</div>
                    <div className="exp">EXP: {user.exp}</div>
                    <div className="attendance">출석: {user.attendance}일</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default Ranking;
