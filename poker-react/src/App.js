import React, { useState, useEffect } from 'react';
import './App.css';
import PlayerSlot from './components/PlayerSlot';
import CommunityCards from './components/CommunityCards';
import CardSelector from './components/CardSelector';
import OutsDisplay from './components/OutsDisplay';
import { Card, monteCarloSimulation, calculateOuts } from './montecarlo';

function App() {
  const [players, setPlayers] = useState([
    { id: 1, cards: [], active: false },
    { id: 2, cards: [], active: false },
    { id: 3, cards: [], active: false }
  ]);
  
  const [communityCards, setCommunityCards] = useState([]);
  const [probabilities, setProbabilities] = useState([0, 0, 0]);
  const [losingPlayerOuts, setLosingPlayerOuts] = useState(null); // { playerIndex, playerName, outs }
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState(null); // { type: 'player'|'community', index, cardIndex }

  // Recalcula probabilidades quando as cartas mudam
  useEffect(() => {
    calculateProbabilities();
  }, [players, communityCards]);

  const calculateProbabilities = async () => {
    const activePlayers = players.filter(p => p.active && p.cards.length === 2);
    
    if (activePlayers.length < 2) {
      setProbabilities([0, 0, 0]);
      setLosingPlayerOuts(null);
      return;
    }

    setIsCalculating(true);
    
    // Pause pra carregar a UI
    setTimeout(() => {
      try {
        const playerHands = activePlayers.map(p => p.cards);
        const results = monteCarloSimulation(playerHands, communityCards, 10000);
        
        const newProbs = [0, 0, 0];
        let resultIndex = 0;
        players.forEach((player, index) => {
          if (player.active && player.cards.length === 2) {
            newProbs[index] = results[resultIndex];
            resultIndex++;
          }
        });
        
        setProbabilities(newProbs);

        // Calcula os outs APENAS do jogador que está perdendo
        if (communityCards.length >= 3) {
          const calculatedOuts = calculateOuts(playerHands, communityCards);
          
          // Encontra o jogador com menor probabilidade (perdendo)
          let losingPlayerIndex = -1;
          let lowestProb = 100;
          
          players.forEach((player, index) => {
            if (player.active && player.cards.length === 2 && newProbs[index] < lowestProb) {
              lowestProb = newProbs[index];
              losingPlayerIndex = index;
            }
          });

          // Encontra o índice correto no array de outs calculados
          let outsIndex = 0;
          let foundOutsIndex = -1;
          players.forEach((player, index) => {
            if (player.active && player.cards.length === 2) {
              if (index === losingPlayerIndex) {
                foundOutsIndex = outsIndex;
              }
              outsIndex++;
            }
          });

          // Define os outs apenas do jogador perdendo
          if (foundOutsIndex >= 0 && calculatedOuts[foundOutsIndex] && calculatedOuts[foundOutsIndex].outs > 0) {
            const outsData = {
              playerIndex: losingPlayerIndex,
              playerName: `Player ${losingPlayerIndex + 1}`,
              outs: calculatedOuts[foundOutsIndex]
            };
            setLosingPlayerOuts(outsData);
          } else {
            setLosingPlayerOuts(null);
          }
        } else {
          setLosingPlayerOuts(null);
        }
        
      } catch (error) {
        console.error('Erro ao calcular probabilidades:', error);
      }
      setIsCalculating(false);
    }, 100);
  };

  const openCardSelector = (type, index, cardIndex = 0) => {
    setSelectorTarget({ type, index, cardIndex });
    setSelectorOpen(true);
  };

  const getCardDisplay = (card) => {
    const ranks = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const rank = ranks[card.value] || card.value;
    const suitSymbols = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };
    const suit = suitSymbols[card.suit] || '';
    const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
    return { rank, suit, color };
  };

  const selectCard = (suit, value) => {
    const newCard = new Card(suit, value);
    
    if (selectorTarget.type === 'player') {
      const newPlayers = [...players];
      const player = newPlayers[selectorTarget.index];
      
      if (!player.active) {
        player.active = true;
        player.cards = [newCard];
      } else if (player.cards.length < 2) {
        player.cards = [...player.cards, newCard];
      } else {
        player.cards[selectorTarget.cardIndex] = newCard;
      }
      
      setPlayers(newPlayers);
    } else if (selectorTarget.type === 'community') {
      const newCommunity = [...communityCards];
      if (selectorTarget.index >= newCommunity.length) {
        newCommunity.push(newCard);
      } else {
        newCommunity[selectorTarget.index] = newCard;
      }
      setCommunityCards(newCommunity);
    }
    
    setSelectorOpen(false);
  };

  const removePlayer = (index) => {
    const newPlayers = [...players];
    newPlayers[index] = { id: index + 1, cards: [], active: false };
    setPlayers(newPlayers);
  };

  const removeCard = (type, playerIndex, cardIndex) => {
    if (type === 'player') {
      const newPlayers = [...players];
      newPlayers[playerIndex].cards.splice(cardIndex, 1);
      if (newPlayers[playerIndex].cards.length === 0) {
        newPlayers[playerIndex].active = false;
      }
      setPlayers(newPlayers);
    } else if (type === 'community') {
      const newCommunity = [...communityCards];
      newCommunity.splice(cardIndex, 1);
      setCommunityCards(newCommunity);
    }
  };

  const reset = () => {
    setPlayers([
      { id: 1, cards: [], active: false },
      { id: 2, cards: [], active: false },
      { id: 3, cards: [], active: false }
    ]);
    setCommunityCards([]);
    setProbabilities([0, 0, 0]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎲 Calculadora de Probabilidades de Poker</h1>
        <button className="reset-button" onClick={reset}>
          🔄 Resetar Mesa
        </button>
      </header>

      {/* Display de Outs no canto superior direito */}
      {losingPlayerOuts && (
        <OutsDisplay 
          playerName={losingPlayerOuts.playerName}
          outs={losingPlayerOuts.outs}
          getCardDisplay={getCardDisplay}
        />
      )}

      <div className="poker-table-container">
        <div className="poker-table">
          {/* Jogador 2 (topo esquerda) */}
          <div className="player-position player-top-left">
            <PlayerSlot
              player={players[1]}
              playerIndex={1}
              probability={probabilities[1]}
              onAddCard={(cardIndex) => openCardSelector('player', 1, cardIndex)}
              onRemoveCard={(cardIndex) => removeCard('player', 1, cardIndex)}
              onRemovePlayer={() => removePlayer(1)}
              isCalculating={isCalculating}
            />
          </div>

          {/* Jogador 3 (topo direita) */}
          <div className="player-position player-top-right">
            <PlayerSlot
              player={players[2]}
              playerIndex={2}
              probability={probabilities[2]}
              onAddCard={(cardIndex) => openCardSelector('player', 2, cardIndex)}
              onRemoveCard={(cardIndex) => removeCard('player', 2, cardIndex)}
              onRemovePlayer={() => removePlayer(2)}
              isCalculating={isCalculating}
            />
          </div>

          {/* Cartas Comunitárias (centro) */}
          <div className="community-cards-position">
            <CommunityCards
              cards={communityCards}
              onAddCard={(index) => openCardSelector('community', index)}
              onRemoveCard={(index) => removeCard('community', 0, index)}
            />
          </div>

          {/* Jogador 1 (base) */}
          <div className="player-position player-bottom">
            <PlayerSlot
              player={players[0]}
              playerIndex={0}
              probability={probabilities[0]}
              onAddCard={(cardIndex) => openCardSelector('player', 0, cardIndex)}
              onRemoveCard={(cardIndex) => removeCard('player', 0, cardIndex)}
              onRemovePlayer={() => removePlayer(0)}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </div>

      {selectorOpen && (
        <CardSelector
          onSelect={selectCard}
          onClose={() => setSelectorOpen(false)}
          usedCards={[...players.flatMap(p => p.cards), ...communityCards]}
        />
      )}

      <a 
        href="https://github.com/Lu15Gustavo/Prob_Poker" 
        target="_blank" 
        rel="noopener noreferrer"
        className="footer-signature"
      >
        by Luis Gustavo
      </a>
    </div>
  );
}

export default App;
