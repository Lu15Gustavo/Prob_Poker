import React from 'react';
import './PlayerSlot.css';

function PlayerSlot({ player, playerIndex, probability, onAddCard, onRemoveCard, onRemovePlayer, isCalculating }) {
  const getSuitSymbol = (suit) => {
    const symbols = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };
    return symbols[suit] || '';
  };

  const getSuitColor = (suit) => {
    return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
  };

  const getCardDisplay = (card) => {
    const ranks = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const rank = ranks[card.value] || card.value;
    return { rank, suit: getSuitSymbol(card.suit), color: getSuitColor(card.suit) };
  };

  if (!player.active) {
    return (
      <div className="player-slot player-empty">
        <button className="add-player-button" onClick={() => onAddCard(0)}>
          <span className="add-icon">+</span>
          <span className="add-text">Adicionar Jogador</span>
        </button>
      </div>
    );
  }

  return (
    <div className="player-slot player-active">
      <button className="remove-player-button" onClick={onRemovePlayer} title="Remover jogador">
        ×
      </button>
      
      <div className="player-info">
        <div className="player-label">Player {playerIndex + 1}</div>
        
        <div className="player-cards">
          {player.cards.map((card, idx) => {
            const display = getCardDisplay(card);
            return (
              <div key={idx} className="card-wrapper">
                <div className={`poker-card ${display.color}`}>
                  <div className="card-value">{display.rank}</div>
                  <div className="card-suit">{display.suit}</div>
                  <button 
                    className="card-remove"
                    onClick={() => onRemoveCard(idx)}
                    title="Remover carta"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
          
          {player.cards.length < 2 && (
            <button 
              className="add-card-button" 
              onClick={() => onAddCard(player.cards.length)}
            >
              +
            </button>
          )}
        </div>

        {player.cards.length === 2 && (
          <div className="player-probability">
            {isCalculating ? (
              <div className="calculating">Calculando...</div>
            ) : (
              <div className="probability-value">
                {probability.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerSlot;
