import React from 'react';
import ReactDOM from 'react-dom/client'; // 변경: ReactDOM from 'react-dom' -> ReactDOM from 'react-dom/client'
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement); // 변경: createRoot 사용
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
