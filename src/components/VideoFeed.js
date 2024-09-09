import React from 'react';

const VideoFeed = () => {
  return (
    <div className="App">
      <h1>Hand Recognition Feed</h1>
      <img
        src="http://localhost:5001/video_feed"  // Flask 서버에서 제공하는 비디오 피드
        alt="Hand Recognition Video Feed"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default VideoFeed;
