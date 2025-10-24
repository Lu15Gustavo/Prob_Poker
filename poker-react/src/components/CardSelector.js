import React from 'react';
import './CardSelector.css';

function CardSelector({ onSelect, onClose, usedCards = [] }) {
  const suits = [
    { name: 'hearts', symbol: '♥', color: 'red' },
    { name: 'diamonds', symbol: '♦', color: 'red' },
    { name: 'clubs', symbol: '♣', color: 'black' },
    { name: 'spades', symbol: '♠', color: 'black' }
  ];

  const values = [
    { value: 14, display: 'A' },
    { value: 13, display: 'K' },
    { value: 12, display: 'Q' },
    { value: 11, display: 'J' },
    { value: 10, display: '10' },
    { value: 9, display: '9' },
    { value: 8, display: '8' },
    { value: 7, display: '7' },
    { value: 6, display: '6' },
    { value: 5, display: '5' },
    { value: 4, display: '4' },
    { value: 3, display: '3' },
    { value: 2, display: '2' }
  ];

  const isCardUsed = (suit, value) => {
    return usedCards.some(card => card.suit === suit && card.value === value);
  };

  return (
    <div className="card-selector-overlay" onClick={onClose}>
      <div className="card-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Selecione uma Carta</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {suits.map((suit) => (
            <div key={suit.name} className="suit-group">
              <div className={`suit-label ${suit.color}`}>
                {suit.symbol} {suit.name === 'hearts' ? 'Copas' : 
                              suit.name === 'diamonds' ? 'Ouros' : 
                              suit.name === 'clubs' ? 'Paus' : 'Espadas'}
              </div>
              
              <div className="cards-grid">
                {values.map((val) => {
                  const used = isCardUsed(suit.name, val.value);
                  return (
                    <button
                      key={`${suit.name}-${val.value}`}
                      className={`select-card ${suit.color} ${used ? 'disabled' : ''}`}
                      onClick={() => !used && onSelect(suit.name, val.value)}
                      disabled={used}
                      title={used ? 'Carta já em uso' : ''}
                    >
                      <div className="card-rank">{val.display}</div>
                      <div className="card-suit-symbol">{suit.symbol}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CardSelector;
