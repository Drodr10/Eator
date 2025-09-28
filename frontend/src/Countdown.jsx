import React, { useState, useEffect } from 'react';

const Countdown = ({ expiresAt }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiresAt) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear the timer if the component is unmounted
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval !== 'seconds') {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {String(timeLeft[interval]).padStart(2, '0')}
        {interval.charAt(0)}{' '}
      </span>
    );
  });

  return (
    <div style={{ color: '#ff4757', fontWeight: 'bold' }}>
      {timerComponents.length ? <>Expires in: {timerComponents}</> : <span>Expired</span>}
    </div>
  );
};

export default Countdown;