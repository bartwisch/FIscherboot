import React from 'react';

const Score = ({ score }) => {
  const scoreStyles = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px 20px',
    borderRadius: '10px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '24px',
    fontWeight: 'bold',
    zIndex: 1000,
  };

  return (
    <div style={scoreStyles}>
      Score: {score}
    </div>
  );
};

export default Score;
