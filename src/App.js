import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure to add some CSS for styling
import Confetti from 'react-confetti';

function App() {
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [strikeRate, setStrikeRate] = useState(0);
  const [targetStrikeRate, setTargetStrikeRate] = useState(20); // Default target strike rate

  // Recalculate strike rate whenever yesCount or noCount changes
  useEffect(() => {
    const total = yesCount + noCount;
    if (total > 0) {
      const rate = ((yesCount / total) * 100).toFixed(2);
      setStrikeRate(rate);
    } else {
      setStrikeRate(0);
    }
  }, [yesCount, noCount]);

  // Handle number input for Yes Signups
  const handleYesInputChange = (e) => {
    const value = e.target.value;
    // Only allow a valid number or an empty string (for backspace)
    setYesCount(value === '' ? '' : Number(value));
  };

  // Handle number input for No Signups
  const handleNoInputChange = (e) => {
    const value = e.target.value;
    // Only allow a valid number or an empty string (for backspace)
    setNoCount(value === '' ? '' : Number(value));
  };

  // Handle target strike rate input
  const handleTargetInputChange = (e) => {
    const value = e.target.value;
    // Only allow a valid number or empty string
    setTargetStrikeRate(value === '' ? '' : Number(value));
  };

  return (
    <div className="container">
      {/* Show confetti if strike rate is above or meets the target */}
      {strikeRate >= targetStrikeRate && <Confetti />}
      
      <h1>🔥 Team KPI Tracker</h1>

      {/* Input for Yes Signups */}
      <div className="input-group">
        <label>✅ Yes Signups:</label>
        <input
          type="number"
          min="0"
          value={yesCount === '' ? '' : yesCount}  // Allow empty input
          onChange={handleYesInputChange}
        />
      </div>

      {/* Input for No Signups */}
      <div className="input-group">
        <label>❌ No Signups:</label>
        <input
          type="number"
          min="0"
          value={noCount === '' ? '' : noCount}  // Allow empty input
          onChange={handleNoInputChange}
        />
      </div>

      {/* Input for Target Strike Rate */}
      <div className="input-group">
        <label>🎯 Set Target Strike Rate (%):</label>
        <input
          type="number"
          min="0"
          value={targetStrikeRate === '' ? '' : targetStrikeRate} // Allow empty input
          onChange={handleTargetInputChange}
        />
      </div>

      {/* Display the Strike Rate */}
      <div className="strike-display">
        <h2>🎯 Strike Rate: {strikeRate}%</h2>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="fill"
            style={{
              width: `${strikeRate}%`,
              backgroundColor: strikeRate >= targetStrikeRate ? '#4caf50' : '#f44336',
            }}
          ></div>
        </div>

        {/* Display Messages Based on Strike Rate Comparison to Target */}
        {strikeRate >= targetStrikeRate ? (
          <p className="message success">Awesome job team! 🎉</p>
        ) : (
          <p className="message">Let’s push harder to hit the target! 💪</p>
        )}
      </div>
    </div>
  );
}

export default App;
