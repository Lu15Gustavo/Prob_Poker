// ============================================
// ALGORITMO DE MONTE CARLO PARA POKER
// ============================================

/**
 * Classe que representa uma carta
 */
class Card {
    constructor(suit, value) {
        this.suit = suit;   // 'hearts', 'diamonds', 'clubs', 'spades'
        this.value = value; // 2-14 (14 = Ás)
    }
    
    toString() {
        const ranks = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
        const rank = ranks[this.value] || this.value;
        const suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return `${rank}${suitSymbols[this.suit]}`;
    }
}

/**
 * Cria um baralho completo de 52 cartas
 */
function createDeck() {
    const deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    for (const suit of suits) {
        for (let value = 2; value <= 14; value++) {
            deck.push(new Card(suit, value));
        }
    }
    
    return deck;
}

/**
 * Embaralha um array usando algoritmo Fisher-Yates
 */
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Remove cartas conhecidas do deck
 */
function removeKnownCards(deck, knownCards) {
    return deck.filter(card => {
        return !knownCards.some(known => 
            known.suit === card.suit && known.value === card.value
        );
    });
}

/**
 * Avalia a força de uma mão de poker (5 cartas)
 * Retorna um valor numérico para comparação
 */
function evaluateHand(cards) {
    if (cards.length !== 5) {
        throw new Error('Deve ter exatamente 5 cartas');
    }
    
    // Ordena cartas por valor
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    
    // Conta frequência de valores
    const valueCounts = {};
    sorted.forEach(card => {
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
    
    // Organiza valores por frequência
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const values = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);
    
    // Verifica flush
    const suits = {};
    sorted.forEach(card => {
        suits[card.suit] = (suits[card.suit] || 0) + 1;
    });
    const isFlush = Object.values(suits).some(count => count === 5);
    
    // Verifica straight
    let isStraight = false;
    if (values.length === 5) {
        // Straight normal
        if (values[0] - values[4] === 4) {
            isStraight = true;
        }
        // Straight A-2-3-4-5
        if (values[0] === 14 && values[1] === 5 && values[2] === 4 && 
            values[3] === 3 && values[4] === 2) {
            isStraight = true;
        }
    }
    
    // Calcula pontuação (maior = melhor)
    let score = 0;
    
    // Royal Flush
    if (isFlush && isStraight && values[0] === 14 && values[1] === 13) {
        score = 10000000;
    }
    // Straight Flush
    else if (isFlush && isStraight) {
        score = 9000000 + values[0];
    }
    // Four of a Kind
    else if (counts[0] === 4) {
        const fourValue = values.find(v => valueCounts[v] === 4);
        const kicker = values.find(v => valueCounts[v] === 1);
        score = 8000000 + fourValue * 100 + kicker;
    }
    // Full House
    else if (counts[0] === 3 && counts[1] === 2) {
        const threeValue = values.find(v => valueCounts[v] === 3);
        const pairValue = values.find(v => valueCounts[v] === 2);
        score = 7000000 + threeValue * 100 + pairValue;
    }
    // Flush
    else if (isFlush) {
        score = 6000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
    }
    // Straight
    else if (isStraight) {
        score = 5000000 + values[0];
    }
    // Three of a Kind
    else if (counts[0] === 3) {
        const threeValue = values.find(v => valueCounts[v] === 3);
        const kickers = values.filter(v => valueCounts[v] === 1);
        score = 4000000 + threeValue * 10000 + kickers[0] * 100 + kickers[1];
    }
    // Two Pair
    else if (counts[0] === 2 && counts[1] === 2) {
        const pairs = values.filter(v => valueCounts[v] === 2);
        const kicker = values.find(v => valueCounts[v] === 1);
        score = 3000000 + pairs[0] * 10000 + pairs[1] * 100 + kicker;
    }
    // One Pair
    else if (counts[0] === 2) {
        const pairValue = values.find(v => valueCounts[v] === 2);
        const kickers = values.filter(v => valueCounts[v] === 1);
        score = 2000000 + pairValue * 10000 + kickers[0] * 1000 + kickers[1] * 100 + kickers[2];
    }
    // High Card
    else {
        score = 1000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
    }
    
    return score;
}

/**
 * Encontra a melhor mão de 5 cartas entre 7 disponíveis
 */
function findBestHand(cards) {
    if (cards.length < 5) {
        throw new Error('Precisa de pelo menos 5 cartas');
    }
    
    if (cards.length === 5) {
        return evaluateHand(cards);
    }
    
    // Gera todas as combinações de 5 cartas
    let bestScore = 0;
    const combinations = [];
    
    // Gera combinações de 5 das 7 cartas
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            for (let k = j + 1; k < cards.length; k++) {
                for (let l = k + 1; l < cards.length; l++) {
                    for (let m = l + 1; m < cards.length; m++) {
                        combinations.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
                    }
                }
            }
        }
    }
    
    // Encontra a melhor combinação
    for (const combo of combinations) {
        const score = evaluateHand(combo);
        bestScore = Math.max(bestScore, score);
    }
    
    return bestScore;
}

/**
 * ALGORITMO DE MONTE CARLO
 * Calcula a probabilidade de vitória através de simulações
 * 
 * @param {Array} playerHands - Array de arrays, cada um com 2 cartas do jogador
 * @param {Array} communityCards - Cartas comunitárias (0-5 cartas)
 * @param {Number} simulations - Número de simulações a executar
 * @returns {Array} - Array com % de vitória de cada jogador
 */
function monteCarloSimulation(playerHands, communityCards = [], simulations = 10000) {
    const numPlayers = playerHands.length;
    const winCounts = new Array(numPlayers).fill(0);
    
    // Coleta todas as cartas conhecidas
    const knownCards = [];
    playerHands.forEach(hand => knownCards.push(...hand));
    knownCards.push(...communityCards);
    
    // Cria deck sem as cartas conhecidas
    const fullDeck = createDeck();
    const availableDeck = removeKnownCards(fullDeck, knownCards);
    
    // Executa simulações
    for (let sim = 0; sim < simulations; sim++) {
        // Embaralha deck disponível
        const shuffledDeck = shuffle(availableDeck);
        
        // Completa as cartas comunitárias até 5
        const simulatedBoard = [...communityCards];
        let deckIndex = 0;
        while (simulatedBoard.length < 5) {
            simulatedBoard.push(shuffledDeck[deckIndex++]);
        }
        
        // Avalia a mão de cada jogador
        const scores = playerHands.map(hand => {
            const allCards = [...hand, ...simulatedBoard];
            return findBestHand(allCards);
        });
        
        // Encontra o melhor score
        const bestScore = Math.max(...scores);
        
        // Identifica vencedores (pode haver empate)
        const winners = [];
        scores.forEach((score, index) => {
            if (score === bestScore) {
                winners.push(index);
            }
        });
        
        // Distribui vitória (divide se houver empate)
        winners.forEach(winner => {
            winCounts[winner] += 1.0 / winners.length;
        });
    }
    
    // Converte contagens em percentuais
    const winPercentages = winCounts.map(count => {
        return (count / simulations) * 100;
    });
    
    return winPercentages;
}

// ============================================
// EXPORTA AS FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Card,
        createDeck,
        shuffle,
        evaluateHand,
        findBestHand,
        monteCarloSimulation
    };
}
