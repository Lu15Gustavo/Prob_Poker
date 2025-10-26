import React from 'react';
import './OutsDisplay.css';

function OutsDisplay({ playerName, outs, getCardDisplay }) {
  if (!outs || outs.outs === 0) {
    return null;
  }

  return (
    <div className="outs-display-fixed">
      <div className="outs-header">
        <span className="outs-player-name">{playerName}</span>
        <span className="outs-count-badge">{outs.outs} OUTS</span>
      </div>
      <div className="outs-cards-grid">
        {outs.outsCards.slice(0, 12).map((card, idx) => {
          const display = getCardDisplay(card);
          return (
            <div key={idx} className={`mini-card ${display.color}`}>
              <span className="mini-rank">{display.rank}</span>
              <span className="mini-suit">{display.suit}</span>
            </div>
          );
        })}
        {outs.outs > 12 && (
          <div className="mini-card-more">
            +{outs.outs - 12}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutsDisplay;
