import React from 'react';
import { Atom } from 'react-loading-indicators';

const Loader = ({ fullPage = true, text = "Loading Data...", color = "#0ca378", size = "medium" }) => {
  const loaderStyle = fullPage ? {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    width: '100%'
  };

  return (
    <div style={loaderStyle}>
      <Atom color={color} size={size} text="" textColor="" />
      {text && (
        <p style={{ 
          marginTop: '20px', 
          color: color, 
          fontWeight: '600',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '1px'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
