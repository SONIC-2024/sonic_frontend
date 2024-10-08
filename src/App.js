import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Ranking from './components/Ranking';
import Training from './components/Training';
import Consonants from './components/Consonants';
import Vowels from './components/Vowels';
import Words from './components/Words';
import ConsonantDetail from './components/ConsonantDetail';
import VowelDetail from './components/VowelDetail';
import WordDetail from './components/WordDetail'; 
import GameLevel1 from './components/GameLevel1';
import GameLevel2 from './components/GameLevel2';
import GameLevel3 from './components/GameLevel3';
import Login from './components/Login';
import Register from './components/Register';
import VideoFeed from './components/VideoFeed';
import OAuthCallback from './components/OAuthCallback'; 
import Starquiz from './components/Starquiz'; 
import GlobalStyle from './styles/GlobalStyle';
import StarquizDetail from './components/StarquizDetail'; 

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/training" element={<Training />} />
          <Route path="/consonants" element={<Consonants />} />
          <Route path="/vowels" element={<Vowels />} />
          <Route path="/words" element={<Words />} />
          <Route path="/consonant-detail/:index" element={<ConsonantDetail />} />
          <Route path="/vowel-detail/:index" element={<VowelDetail />} />
          <Route path="/word-detail/:id" element={<WordDetail />} />
          <Route path="/game-level1" element={<GameLevel1 />} />  {/* quizId 없이 기본 경로 */}
          <Route path="/game-level1/:quizId" element={<GameLevel1 />} />  {/* quizId에 따라 다르게 표시 */}
          <Route path="/game-level2" element={<GameLevel2 />} />  {/* quizId 없이 기본 경로 */}
          <Route path="/game-level2/:quizId" element={<GameLevel2 />} />  {/* quizId에 따라 다르게 표시 */}
          <Route path="/game-level3" element={<GameLevel3 />} />  {/* quizId 없이 기본 경로 */}
          <Route path="/game-level3/:quizId" element={<GameLevel3 />} />  {/* quizId에 따라 다르게 표시 */}
          <Route path="/video-feed" element={<VideoFeed />} />
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route path="/starquiz" element={<Starquiz />} />
          <Route path="/starquizdetail/:level/:quizId" element={<StarquizDetail />} /> {/* 퀴즈 즐겨찾기 상세 경로 */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
