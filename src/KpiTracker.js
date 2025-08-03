// src/KpiTracker.js
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import './KpiTracker.css';
import { supabase } from './supabaseClient';  // your Supabase client

function KpiTracker({ store, onLogout }) {
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [strikeRate, setStrikeRate] = useState(0);
  const [targetStrikeRate, setTargetStrikeRate] = useState(20);
  const [additionalYesNeeded, setAdditionalYesNeeded] = useState(0);

  const [submitStatus, setSubmitStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); // new: toggle confirmation dialog

  useEffect(() => {
    const y = yesCount;
    const n = noCount;
    const t = targetStrikeRate;

    const total = y + n;
    const rate = total > 0 ? (y / total) * 100 : 0;
    setStrikeRate(rate.toFixed(2));

    if (rate >= t || total === 0 || t >= 100) {
      setAdditionalYesNeeded(0);
    } else {
      const numerator = t * y - 100 * y + t * n;
      const denominator = 100 - t;

      const needed = Math.ceil(numerator / denominator);
      setAdditionalYesNeeded(needed > 0 ? needed : 0);
    }
  }, [yesCount, noCount, targetStrikeRate]);

  const handleSubmitClick = () => {
    // Validate inputs before showing confirm dialog
    if (yesCount === '' || noCount === '' || targetStrikeRate === '') {
      setSubmitStatus({ success: false, message: 'Please fill all fields before submitting.' });
      return;
    }
    setSubmitStatus(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitStatus(null);
    setShowConfirm(false);

    const data = {
      store_id: store.id,
      store_name: store.name,
      yes_count: yesCount,
      no_count: noCount,
      strike_rate: Number(strikeRate),
      target_strike_rate: targetStrikeRate,
      additional_yes_needed: additionalYesNeeded,
    };

    const { error } = await supabase.from('kpi_submissions').insert([data]);

    if (error) {
      setSubmitStatus({ success: false, message: error.message });
    } else {
      setSubmitStatus({ success: true, message: 'KPI submitted successfully!' });
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>

      <div className="welcome-message">Welcome Store: Cheapside</div>

      <h1>🔥 Team KPI Tracker</h1>

      <div className="input-group">
        <label>✅ Yes Signups:</label>
        <input
          type="number"
          min="0"
          value={yesCount === '' ? '' : yesCount}
          onChange={(e) => setYesCount(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', marginBottom: 10 }}
        />
      </div>

      <div className="input-group">
        <label>❌ No Signups:</label>
        <input
          type="number"
          min="0"
          value={noCount === '' ? '' : noCount}
          onChange={(e) => setNoCount(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', marginBottom: 10 }}
        />
      </div>

      <div className="input-group">
        <label>🎯 Set Target Strike Rate (%):</label>
        <input
          type="number"
          min="0"
          value={targetStrikeRate === '' ? '' : targetStrikeRate}
          onChange={(e) => setTargetStrikeRate(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', marginBottom: 10 }}
        />
      </div>

      <div className="strike-display">
        <h2>🎯 Strike Rate: {strikeRate}%</h2>

        <div
          className="progress-bar"
          style={{ backgroundColor: '#ddd', height: 20, width: '100%', borderRadius: 5, overflow: 'hidden' }}
        >
          <div
            className="fill"
            style={{
              width: `${strikeRate}%`,
              backgroundColor: strikeRate >= targetStrikeRate ? '#4caf50' : '#f44336',
              height: '100%',
            }}
          ></div>
        </div>

        {strikeRate >= targetStrikeRate ? (
          <p className="message success">Awesome job team! 🎉</p>
        ) : (
          <>
            <p className="message">Let’s push harder to hit the target! 💪</p>
            {additionalYesNeeded > 0 && (
              <p className="message highlight">
                ➕ You need <strong>{additionalYesNeeded}</strong> more <strong>YES</strong> signups to reach the target.
              </p>
            )}
          </>
        )}
      </div>

      {!showConfirm && (
        <button onClick={handleSubmitClick} className="submit-button" style={{ marginTop: 20 }}>
          Submit to RM
        </button>
      )}

      {showConfirm && (
        <div className="confirm-dialog" style={{
          border: '1px solid #ccc',
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
          backgroundColor: '#fafafa',
          textAlign: 'left'
        }}>
          <h3>Please confirm your submission</h3>
          <p><strong>Store:</strong> {store.name}</p>
          <p><strong>Yes Signups:</strong> {yesCount}</p>
          <p><strong>No Signups:</strong> {noCount}</p>
          <p><strong>Strike Rate:</strong> {strikeRate}%</p>
          <p><strong>Target Strike Rate:</strong> {targetStrikeRate}%</p>
          <p><strong>Additional YES needed:</strong> {additionalYesNeeded}</p>
          
          <div style={{ marginTop: 15, display: 'flex', gap: '10px' }}>
            <button onClick={handleConfirmSubmit} className="submit-button" style={{ flex: 1 }}>
              Yes, Submit
            </button>
            <button onClick={handleCancel} style={{ flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {submitStatus && (
        <p className={submitStatus.success ? 'success-message' : 'error-message'} style={{ marginTop: 10 }}>
          {submitStatus.message}
        </p>
      )}

      {strikeRate >= targetStrikeRate && <Confetti />}
    </div>
  );
}

export default KpiTracker;
