import React from 'react';

const TouchInstructions = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '10px',
      textAlign: 'center',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      userSelect: 'none',
      pointerEvents: 'none'
    }}>
      <div style={{ marginBottom: '5px' }}>
        🎣 <strong>Fishing Game</strong> 🎣
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        Tap anywhere or press SPACE to cast your lure!
      </div>
      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
        Aim with the swinging pendulum • Catch goldfish for points
      </div>
    </div>
  );
};

export default TouchInstructions;