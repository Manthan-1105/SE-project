import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-logo">
      <div className="loading-icon">💸</div>
      <h1 className="loading-title">SpendSmart</h1>
    </div>
    <div className="loading-bar">
      <div className="loading-bar-fill" />
    </div>
  </div>
);

export default LoadingScreen;
