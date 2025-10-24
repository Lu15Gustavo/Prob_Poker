import React from 'react';
import './CommunityCards.css';

function CommunityCards({ cards, onAddCard, onRemoveCard }) {
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

  return (
    <div className="community-cards">
      <div className="community-label">Cartas Comunitárias</div>
      
      <div className="community-cards-row">
        {[0, 1, 2, 3, 4].map((index) => {
          const card = cards[index];
          
          if (card) {
            const display = getCardDisplay(card);
            return (
              <div key={index} className="community-card-wrapper">
                <div className={`poker-card ${display.color}`}>
                  <div className="card-value">{display.rank}</div>
                  <div className="card-suit">{display.suit}</div>
                  <button 
                    className="card-remove"
                    onClick={() => onRemoveCard(index)}
                    title="Remover carta"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          }
          
          return (
            <button 
              key={index}
              className="community-card-empty"
              onClick={() => onAddCard(index)}
              title="Adicionar carta"
            >
              <div className="card-shadow">?</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CommunityCards;
