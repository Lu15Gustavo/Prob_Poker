// Classe para representar uma carta
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.value = this.getRankValue();
    }

    getRankValue() {
        switch(this.rank) {
            case 'A': return 14;
            case 'K': return 13;
            case 'Q': return 12;
            case 'J': return 11;
            default: return parseInt(this.rank);
        }
    }

    toString() {
        return `${this.rank}${this.getSuitSymbol()}`;
    }

    getSuitSymbol() {
        switch(this.suit) {
            case 'hearts': return '♥️';
            case 'diamonds': return '♦️';
            case 'clubs': return '♣️';
            case 'spades': return '♠️';
        }
    }

    isRed() {
        return this.suit === 'hearts' || this.suit === 'diamonds';
    }
}

// Variáveis globais
let selectedSlot = null;
let gameState = {
    players: Array(4).fill(null).map(() => [null, null]), // 4 jogadores, 2 cartas cada
    communityCards: [null, null, null, null, null],
    usedCards: new Set()
};

let modal = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateProbabilities();
});

function initializeEventListeners() {
    // Modal
    modal = document.getElementById('cardModal');
    const closeBtn = document.querySelector('.close');
    
    // Slots de cartas - abre modal
    document.querySelectorAll('.card-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            openCardModal(this);
        });
    });

    // Cartas no modal
    document.querySelectorAll('.card-option').forEach(card => {
        card.addEventListener('click', function() {
            selectCardFromModal(this);
        });
    });

    // Fechar modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });



    // Botões de controle
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('randomHand').addEventListener('click', dealRandomHand);
    document.getElementById('dealFlop').addEventListener('click', dealFlop);
    document.getElementById('dealTurn').addEventListener('click', dealTurn);
    document.getElementById('dealRiver').addEventListener('click', dealRiver);
    document.getElementById('runTests').addEventListener('click', runProbabilityTests);
}

function openCardModal(slot) {
    selectedSlot = slot;
    modal.style.display = 'block';
    
    // Atualiza o estado das cartas (disponíveis/usadas)
    updateCardAvailability();
}

function closeModal() {
    modal.style.display = 'none';
    selectedSlot = null;
}

function selectCardFromModal(cardElement) {
    if (cardElement.classList.contains('used')) {
        alert('Esta carta já está sendo usada!');
        return;
    }
    
    const rank = cardElement.dataset.rank;
    const suit = cardElement.dataset.suit;
    
    placeCard(rank, suit);
    closeModal();
}

function updateCardAvailability() {
    document.querySelectorAll('.card-option').forEach(card => {
        const cardKey = `${card.dataset.rank}_${card.dataset.suit}`;
        if (gameState.usedCards.has(cardKey)) {
            card.classList.add('used');
        } else {
            card.classList.remove('used');
        }
    });
}

function getActivePlayers() {
    // Retorna array de índices dos jogadores que têm pelo menos uma carta
    const activePlayers = [];
    for (let i = 0; i < 4; i++) {
        const playerCards = gameState.players[i].filter(card => card !== null);
        if (playerCards.length > 0) {
            activePlayers.push(i);
        }
    }
    return activePlayers;
}

function updatePlayerVisuals() {
    // Atualiza visual dos jogadores baseado se têm cartas ou não
    for (let i = 0; i < 4; i++) {
        const playerSeat = document.querySelector(`[data-player="${i}"]`);
        const playerCards = gameState.players[i].filter(card => card !== null);
        
        if (playerSeat) {
            if (playerCards.length === 0) {
                playerSeat.classList.add('inactive');
            } else {
                playerSeat.classList.remove('inactive');
            }
        }
    }
}



function placeCard(rank, suit) {
    if (!selectedSlot || !rank || !suit) return;
    
    const cardKey = `${rank}_${suit}`;
    
    // Verifica se a carta já está sendo usada
    if (gameState.usedCards.has(cardKey)) {
        alert('Esta carta já está sendo usada!');
        return;
    }
    
    // Remove carta antiga se existir
    removeCardFromSlot(selectedSlot);
    
    // Cria nova carta
    const card = new Card(rank, suit);
    
    // Adiciona carta ao estado do jogo
    const playerIndex = parseInt(selectedSlot.dataset.player);
    const cardIndex = parseInt(selectedSlot.dataset.card);
    
    if (selectedSlot.dataset.position) {
        // É uma carta comunitária
        const communityIndex = getCommunitCardIndex(selectedSlot.dataset.position);
        gameState.communityCards[communityIndex] = card;
    } else {
        // É uma carta de jogador
        gameState.players[playerIndex][cardIndex] = card;
    }
    
    gameState.usedCards.add(cardKey);
    
    // Atualiza a interface
    updateCardDisplay(selectedSlot, card);
    
    // Atualiza visuais e probabilidades
    updatePlayerVisuals();
    updateProbabilities();
}

function getCommunitCardIndex(position) {
    switch(position) {
        case 'flop1': return 0;
        case 'flop2': return 1;
        case 'flop3': return 2;
        case 'turn': return 3;
        case 'river': return 4;
    }
}

function removeCardFromSlot(slot) {
    let removedCard = null;
    
    if (slot.dataset.position) {
        // É uma carta comunitária
        const index = getCommunitCardIndex(slot.dataset.position);
        removedCard = gameState.communityCards[index];
        gameState.communityCards[index] = null;
    } else {
        // É uma carta de jogador
        const playerIndex = parseInt(slot.dataset.player);
        const cardIndex = parseInt(slot.dataset.card);
        removedCard = gameState.players[playerIndex][cardIndex];
        gameState.players[playerIndex][cardIndex] = null;
    }
    
    if (removedCard) {
        const cardKey = `${removedCard.rank}_${removedCard.suit}`;
        gameState.usedCards.delete(cardKey);
    }
}

function removePlayerCards(playerIndex) {
    // Remove cartas do jogador
    for (let i = 0; i < 2; i++) {
        const card = gameState.players[playerIndex][i];
        if (card) {
            const cardKey = `${card.rank}_${card.suit}`;
            gameState.usedCards.delete(cardKey);
            gameState.players[playerIndex][i] = null;
        }
    }
    
    // Atualiza interface
    const slots = document.querySelectorAll(`[data-player="${playerIndex}"]`);
    slots.forEach(slot => {
        slot.innerHTML = '<div class="card-placeholder">?</div>';
    });
}

function updateCardDisplay(slot, card) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.isRed() ? 'red' : 'black'}`;
    cardElement.innerHTML = `
        <div class="rank">${card.rank}</div>
        <div class="suit">${card.getSuitSymbol()}</div>
    `;
    
    slot.innerHTML = '';
    slot.appendChild(cardElement);
}

function clearSelections() {
    document.querySelectorAll('.card-slot').forEach(s => s.classList.remove('selected'));
    selectedSlot = null;
}

function clearAll() {
    // Limpa estado do jogo
    gameState.players = Array(4).fill(null).map(() => [null, null]);
    gameState.communityCards = [null, null, null, null, null];
    gameState.usedCards.clear();
    
    // Limpa interface
    document.querySelectorAll('.card-slot').forEach(slot => {
        slot.innerHTML = '<div class="card-placeholder">?</div>';
    });
    
    clearSelections();
    updateProbabilities();
}

function dealRandomHand() {
    // Limpa mão atual do jogador 1
    const slot1 = document.querySelector('[data-player="0"][data-card="0"]');
    const slot2 = document.querySelector('[data-player="0"][data-card="1"]');
    
    removeCardFromSlot(slot1);
    removeCardFromSlot(slot2);
    
    // Gera duas cartas aleatórias
    const availableCards = getAvailableCards();
    if (availableCards.length < 2) return;
    
    const card1 = availableCards[Math.floor(Math.random() * availableCards.length)];
    const card2Index = Math.floor(Math.random() * (availableCards.length - 1));
    const card2 = availableCards.filter(c => c !== card1)[card2Index];
    
    // Coloca as cartas
    gameState.players[0][0] = card1;
    gameState.players[0][1] = card2;
    gameState.usedCards.add(`${card1.rank}_${card1.suit}`);
    gameState.usedCards.add(`${card2.rank}_${card2.suit}`);
    
    // Atualiza interface
    updateCardDisplay(slot1, card1);
    updateCardDisplay(slot2, card2);
    
    updateProbabilities();
}

function dealFlop() {
    for (let i = 0; i < 3; i++) {
        if (!gameState.communityCards[i]) {
            dealRandomCommunityCard(i);
        }
    }
}

function dealTurn() {
    if (!gameState.communityCards[3]) {
        dealRandomCommunityCard(3);
    }
}

function dealRiver() {
    if (!gameState.communityCards[4]) {
        dealRandomCommunityCard(4);
    }
}

function dealRandomCommunityCard(index) {
    const availableCards = getAvailableCards();
    if (availableCards.length === 0) return;
    
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    gameState.communityCards[index] = card;
    gameState.usedCards.add(`${card.rank}_${card.suit}`);
    
    const positions = ['flop1', 'flop2', 'flop3', 'turn', 'river'];
    const slot = document.querySelector(`[data-position="${positions[index]}"]`);
    updateCardDisplay(slot, card);
    
    updateProbabilities();
}

function getAvailableCards() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    const availableCards = [];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            const cardKey = `${rank}_${suit}`;
            if (!gameState.usedCards.has(cardKey)) {
                availableCards.push(new Card(rank, suit));
            }
        }
    }
    
    return availableCards;
}

function updateProbabilities() {
    const communityCards = gameState.communityCards.filter(card => card !== null);
    const activePlayersIndexes = getActivePlayers();
    const numActivePlayers = activePlayersIndexes.length;
    
    // Limpa probabilidades se não há jogadores suficientes
    if (numActivePlayers < 1) {
        for (let i = 0; i < 4; i++) {
            updatePlayerProbability(i, '--');
        }
        return;
    }
    
    // Calcula probabilidades individuais para cada jogador usando Monte Carlo
    calculateIndividualProbabilities(communityCards, numActivePlayers);
}

function updatePlayerProbability(playerIndex, probability) {
    const seat = document.querySelector(`[data-player="${playerIndex}"]`);
    if (seat) {
        const probElement = seat.querySelector('.win-probability');
        if (probElement) {
            probElement.textContent = probability === '--' ? '--' : `${probability}%`;
        }
    }
}

function calculateHandStrength(playerCards, communityCards) {
    const allCards = [...playerCards, ...communityCards];
    
    // Se temos 5 ou mais cartas, avaliamos a melhor mão possível
    if (allCards.length >= 5) {
        const bestHand = evaluateHand(allCards);
        // Converte o rank da mão em uma pontuação base
        let baseStrength = bestHand.rank * 100;
        
        // Adiciona bônus baseado nas cartas mais altas
        const sortedCards = allCards.slice().sort((a, b) => b.value - a.value);
        for (let i = 0; i < Math.min(2, sortedCards.length); i++) {
            baseStrength += sortedCards[i].value;
        }
        
        return baseStrength;
    } else {
        // Para pré-flop, usa uma avaliação simplificada baseada nas cartas hole
        const card1 = playerCards[0];
        const card2 = playerCards[1];
        
        let strength = 0;
        
        // Pares valem mais
        if (card1.value === card2.value) {
            strength = 200 + card1.value * 10;
        } else {
            // Cartas altas valem mais
            strength = (card1.value + card2.value) * 5;
            
            // Suited vale mais
            if (card1.suit === card2.suit) {
                strength += 20;
            }
            
            // Conectores valem mais
            if (Math.abs(card1.value - card2.value) === 1) {
                strength += 15;
            }
        }
        
        return strength;
    }
}

function calculateIndividualProbabilities(communityCards, totalActivePlayers) {
    const activePlayersIndexes = getActivePlayers();
    
    if (activePlayersIndexes.length < 2) {
        // Se há apenas 1 jogador ou menos, não há competição
        for (let i = 0; i < 4; i++) {
            updatePlayerProbability(i, activePlayersIndexes.includes(i) ? '100.0%' : '--');
        }
        return;
    }
    
    // Mostra "Calculando..." durante a simulação
    activePlayersIndexes.forEach(i => {
        updatePlayerProbability(i, 'Calc...');
    });
    
    // Executa simulação Monte Carlo de forma assíncrona
    setTimeout(() => {
        const results = runMonteCarloSimulation(activePlayersIndexes, communityCards);
        
        // Atualiza display com resultados
        for (let i = 0; i < 4; i++) {
            if (activePlayersIndexes.includes(i)) {
                updatePlayerProbability(i, `${results[i].toFixed(1)}%`);
            } else {
                updatePlayerProbability(i, '--');
            }
        }
    }, 50); // Pequeno delay para mostrar o "Calculando..."
}

function runMonteCarloSimulation(activePlayersIndexes, communityCards) {
    const SIMULATIONS = 25000; // Alta precisão para todas as situações
    const winCounts = new Array(4).fill(0);
    
    // Cria deck excluindo cartas conhecidas
    const availableCards = createDeckExcludingKnownCards(activePlayersIndexes, communityCards);
    
    // Executa simulações Monte Carlo
    for (let sim = 0; sim < SIMULATIONS; sim++) {
        const shuffled = shuffleArray([...availableCards]);
        const completeBoard = completeBoard_v2(communityCards, shuffled);
        const winners = determineWinners(activePlayersIndexes, completeBoard);
        
        // Distribui pontos
        winners.forEach(winner => {
            winCounts[winner] += 1.0 / winners.length;
        });
    }
    
    // Converte para percentuais
    const results = new Array(4).fill(0);
    activePlayersIndexes.forEach(i => {
        results[i] = (winCounts[i] / SIMULATIONS) * 100;
    });
    
    return results;
}

// Função de teste para validar probabilidades conhecidas
function runProbabilityTests() {
    console.log('\n=== INICIANDO TESTES DE PROBABILIDADE ===');
    
    // Teste 1: AA vs KK pré-flop
    console.log('\nTeste 1: AA vs KK pré-flop');
    const testResult1 = testAAvsKKPreflop();
    console.log(`AA: ${testResult1.aa.toFixed(1)}% | KK: ${testResult1.kk.toFixed(1)}%`);
    console.log(`Esperado: AA ~81% | KK ~19%`);
    
    // Teste 2: AK vs QQ pré-flop
    console.log('\nTeste 2: AK vs QQ pré-flop');
    const testResult2 = testAKvsQQPreflop();
    console.log(`AK: ${testResult2.ak.toFixed(1)}% | QQ: ${testResult2.qq.toFixed(1)}%`);
    console.log(`Esperado: AK ~43% | QQ ~57%`);
    
    // Teste 3: AA vs KK no flop K-4-4
    console.log('\nTeste 3: AA vs KK no flop K♦4♦4♣');
    const testResult3 = testAAvsKKOnFlop();
    console.log(`AA: ${testResult3.aa.toFixed(1)}% | KK: ${testResult3.kk.toFixed(1)}%`);
    console.log(`Esperado: AA ~4.3% | KK ~95.7%`);
    
    // Teste 4: Set vs Flush Draw
    console.log('\nTeste 4: Set vs Flush Draw');
    const testResult4 = testSetVsFlushDraw();
    console.log(`Set: ${testResult4.set.toFixed(1)}% | Flush Draw: ${testResult4.draw.toFixed(1)}%`);
    console.log(`Esperado: Set ~65% | Flush Draw ~35%`);
    
    // Teste 5: Avaliação de mãos
    console.log('\nTeste 5: Avaliação de mãos');
    testHandEvaluation();
    
    console.log('\n=== TESTES CONCLUÍDOS ===');
}

function testHandEvaluation() {
    // Testa se a avaliação de mãos está funcionando corretamente
    
    // Royal Flush
    const royalFlush = [
        new Card('spades', 14), new Card('spades', 13), new Card('spades', 12),
        new Card('spades', 11), new Card('spades', 10)
    ];
    const rfEval = evaluateHandSimple(royalFlush);
    console.log(`Royal Flush: ${rfEval.name} (${rfEval.value})`);
    
    // Full House Ases cheio de Reis
    const fullHouse = [
        new Card('hearts', 14), new Card('spades', 14), new Card('clubs', 14),
        new Card('diamonds', 13), new Card('hearts', 13)
    ];
    const fhEval = evaluateHandSimple(fullHouse);
    console.log(`Full House A-A-A-K-K: ${fhEval.name} (${fhEval.value})`);
    
    // Full House Reis cheio de 4s
    const fullHouse2 = [
        new Card('hearts', 13), new Card('spades', 13), new Card('clubs', 13),
        new Card('diamonds', 4), new Card('hearts', 4)
    ];
    const fh2Eval = evaluateHandSimple(fullHouse2);
    console.log(`Full House K-K-K-4-4: ${fh2Eval.name} (${fh2Eval.value})`);
    
    // Verifica se Full House de Ases é maior que Full House de Reis
    console.log(`A-A-A-K-K > K-K-K-4-4: ${fhEval.value > fh2Eval.value}`);
    
    // Teste com 7 cartas - AA no flop K-4-4 com turn A
    const sevenCards = [
        new Card('hearts', 14), new Card('spades', 14),    // AA
        new Card('diamonds', 13), new Card('diamonds', 4), new Card('clubs', 4), // K-4-4
        new Card('clubs', 14), new Card('hearts', 2)       // A-2 (turn/river)
    ];
    const sevenEval = evaluateHandSimple(sevenCards);
    console.log(`AA com K-4-4-A-2: ${sevenEval.name} (${sevenEval.value})`);
}

function testAAvsKKPreflop() {
    // Simula AA vs KK pré-flop
    const savedState = JSON.parse(JSON.stringify(gameState));
    
    // Setup: Jogador 0 = AA, Jogador 1 = KK
    gameState.players[0] = [new Card('hearts', 14), new Card('spades', 14)];
    gameState.players[1] = [new Card('clubs', 13), new Card('diamonds', 13)];
    gameState.communityCards = [];
    
    const results = runMonteCarloSimulation([0, 1], []);
    
    // Restaura estado
    gameState = savedState;
    
    return { aa: results[0], kk: results[1] };
}

function testAKvsQQPreflop() {
    // Simula AK vs QQ pré-flop
    const savedState = JSON.parse(JSON.stringify(gameState));
    
    // Setup: Jogador 0 = AK, Jogador 1 = QQ
    gameState.players[0] = [new Card('hearts', 14), new Card('spades', 13)];
    gameState.players[1] = [new Card('clubs', 12), new Card('diamonds', 12)];
    gameState.communityCards = [];
    
    const results = runMonteCarloSimulation([0, 1], []);
    
    // Restaura estado
    gameState = savedState;
    
    return { ak: results[0], qq: results[1] };
}

function testAAvsKKOnFlop() {
    // Simula AA vs KK no flop K♦4♦4♣
    const savedState = JSON.parse(JSON.stringify(gameState));
    
    // Setup
    gameState.players[0] = [new Card('hearts', 14), new Card('spades', 14)];
    gameState.players[1] = [new Card('clubs', 13), new Card('diamonds', 13)];
    const flop = [
        new Card('diamonds', 13), // K♦
        new Card('diamonds', 4),  // 4♦
        new Card('clubs', 4)      // 4♣
    ];
    
    const results = runMonteCarloSimulation([0, 1], flop);
    
    // Restaura estado
    gameState = savedState;
    
    return { aa: results[0], kk: results[1] };
}

function testSetVsFlushDraw() {
    // Simula 77 (set) vs A♠9♠ (flush draw) no flop 7♦2♠5♠
    const savedState = JSON.parse(JSON.stringify(gameState));
    
    // Setup: Jogador 0 = 77 (set), Jogador 1 = A♠9♠ (flush draw)
    gameState.players[0] = [new Card('hearts', 7), new Card('clubs', 7)];
    gameState.players[1] = [new Card('spades', 14), new Card('spades', 9)];
    const flop = [
        new Card('diamonds', 7), // 7♦ (dá set para jogador 0)
        new Card('spades', 2),   // 2♠ 
        new Card('spades', 5)    // 5♠ (flush draw para jogador 1)
    ];
    
    const results = runMonteCarloSimulation([0, 1], flop);
    
    // Restaura estado
    gameState = savedState;
    
    return { set: results[0], draw: results[1] };
}



function createDeckExcludingKnownCards(activePlayersIndexes, communityCards) {
    const knownCards = new Set();
    
    // Adiciona cartas dos jogadores
    activePlayersIndexes.forEach(playerIndex => {
        gameState.players[playerIndex]
            .filter(card => card !== null)
            .forEach(card => knownCards.add(`${card.suit}-${card.value}`));
    });
    
    // Adiciona cartas comunitárias
    communityCards
        .filter(card => card !== null)
        .forEach(card => knownCards.add(`${card.suit}-${card.value}`));
    
    // Cria deck completo
    const deck = [];
    ['hearts', 'diamonds', 'clubs', 'spades'].forEach(suit => {
        for (let value = 2; value <= 14; value++) {
            if (!knownCards.has(`${suit}-${value}`)) {
                deck.push(new Card(suit, value));
            }
        }
    });
    
    return deck;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function completeBoard_v2(communityCards, shuffledDeck) {
    const board = [...communityCards];
    let deckIndex = 0;
    
    while (board.length < 5 && deckIndex < shuffledDeck.length) {
        board.push(shuffledDeck[deckIndex++]);
    }
    
    return board;
}

function determineWinners(activePlayersIndexes, completeBoard) {
    let bestValue = -1;
    const playerEvaluations = [];
    
    // Avalia cada jogador
    activePlayersIndexes.forEach(playerIndex => {
        const playerCards = gameState.players[playerIndex].filter(c => c !== null);
        if (playerCards.length === 2) {
            const allCards = [...playerCards, ...completeBoard];
            const evaluation = evaluateHandSimple(allCards);
            playerEvaluations.push({ playerIndex, value: evaluation.value });
            bestValue = Math.max(bestValue, evaluation.value);
        }
    });
    
    // Retorna vencedores
    return playerEvaluations
        .filter(p => p.value === bestValue)
        .map(p => p.playerIndex);
}



function evaluateHandSimple(cards) {
    // Função universal para avaliar qualquer número de cartas (5, 6 ou 7)
    if (cards.length < 5) {
        return { name: 'Mão incompleta', value: 0 };
    }
    
    if (cards.length === 5) {
        return evaluateFiveCards(cards);
    }
    
    // Para 6 ou 7 cartas, encontra a melhor combinação de 5
    let bestEvaluation = { name: 'High Card', value: 0 };
    const combinations = generateCombinations(cards, 5);
    
    for (const combination of combinations) {
        const evaluation = evaluateFiveCards(combination);
        if (evaluation.value > bestEvaluation.value) {
            bestEvaluation = evaluation;
        }
    }
    
    return bestEvaluation;
}

function generateCombinations(array, size) {
    const result = [];
    
    function combine(start, combination) {
        if (combination.length === size) {
            result.push([...combination]);
            return;
        }
        
        for (let i = start; i < array.length; i++) {
            combination.push(array[i]);
            combine(i + 1, combination);
            combination.pop();
        }
    }
    
    combine(0, []);
    return result;
}

function collectKnownCards(activePlayersIndexes, communityCards) {
    const knownCards = new Set();
    
    // Adiciona cartas dos jogadores
    activePlayersIndexes.forEach(playerIndex => {
        const playerCards = gameState.players[playerIndex].filter(card => card !== null);
        playerCards.forEach(card => {
            knownCards.add(`${card.suit}-${card.value}`);
        });
    });
    
    // Adiciona cartas comunitárias
    communityCards.forEach(card => {
        if (card) {
            knownCards.add(`${card.suit}-${card.value}`);
        }
    });
    
    return knownCards;
}

function createAvailableDeck(knownCards) {
    const deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    for (const suit of suits) {
        for (let value = 2; value <= 14; value++) {
            const cardKey = `${suit}-${value}`;
            if (!knownCards.has(cardKey)) {
                deck.push(new Card(suit, value));
            }
        }
    }
    
    return deck;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function simulateHand(activePlayersIndexes, communityCards, shuffledDeck) {
    let deckIndex = 0;
    
    // Completa as cartas comunitárias até 5
    const fullBoard = [...communityCards];
    while (fullBoard.length < 5 && deckIndex < shuffledDeck.length) {
        fullBoard.push(shuffledDeck[deckIndex++]);
    }
    
    // Avalia a mão de cada jogador ativo
    const playerResults = [];
    let bestHandValue = -1;
    
    for (const playerIndex of activePlayersIndexes) {
        const playerCards = gameState.players[playerIndex].filter(card => card !== null);
        
        if (playerCards.length === 2) {
            // Combina cartas do jogador com cartas comunitárias
            const allPlayerCards = [...playerCards, ...fullBoard];
            const handEvaluation = evaluateHand(allPlayerCards);
            
            playerResults.push({
                playerIndex: playerIndex,
                handValue: handEvaluation.value,
                handName: handEvaluation.name
            });
            
            bestHandValue = Math.max(bestHandValue, handEvaluation.value);
        }
    }
    
    // Encontra todos os jogadores com a melhor mão
    const winners = playerResults
        .filter(result => result.handValue === bestHandValue)
        .map(result => result.playerIndex);
    
    return winners;
}



function evaluateHand(cards) {
    if (cards.length < 5) {
        return { name: 'Mão incompleta', rank: 0, value: 0 };
    }
    
    // Encontra a melhor combinação de 5 cartas
    const bestHand = findBestFiveCardHand(cards);
    return evaluateFiveCards(bestHand);
}

function findBestFiveCardHand(cards) {
    if (cards.length === 5) return cards;
    
    let bestHand = null;
    let bestValue = 0;
    
    // Gera todas as combinações possíveis de 5 cartas
    const combinations = getCombinations(cards, 5);
    
    for (const combination of combinations) {
        const evaluation = evaluateFiveCards(combination);
        if (evaluation.value > bestValue) {
            bestValue = evaluation.value;
            bestHand = combination;
        }
    }
    
    return bestHand;
}

function getCombinations(array, size) {
    if (size > array.length) return [];
    if (size === array.length) return [array];
    
    const combinations = [];
    
    function generate(start, combo) {
        if (combo.length === size) {
            combinations.push([...combo]);
            return;
        }
        
        for (let i = start; i < array.length; i++) {
            combo.push(array[i]);
            generate(i + 1, combo);
            combo.pop();
        }
    }
    
    generate(0, []);
    return combinations;
}

function evaluateFiveCards(cards) {
    // Ordena cartas por valor (maior para menor)
    const sortedCards = cards.slice().sort((a, b) => b.value - a.value);
    
    // Conta frequência de cada valor
    const valueCounts = {};
    sortedCards.forEach(card => {
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
    
    // Organiza valores por frequência
    const countGroups = {};
    Object.entries(valueCounts).forEach(([value, count]) => {
        if (!countGroups[count]) countGroups[count] = [];
        countGroups[count].push(parseInt(value));
    });
    
    // Ordena cada grupo por valor (maior primeiro)
    Object.keys(countGroups).forEach(count => {
        countGroups[count].sort((a, b) => b - a);
    });
    
    // Verifica flush
    const suits = {};
    sortedCards.forEach(card => {
        suits[card.suit] = (suits[card.suit] || 0) + 1;
    });
    const isFlush = Object.values(suits).some(count => count >= 5);
    
    // Verifica straight
    const uniqueValues = [...new Set(sortedCards.map(c => c.value))].sort((a, b) => b - a);
    const isStraight = checkStraight(uniqueValues);
    
    // Royal Flush (A-K-Q-J-10 suited)
    if (isFlush && isStraight && uniqueValues[0] === 14 && uniqueValues.includes(13)) {
        return { name: 'Royal Flush', rank: 10, value: 10000000 };
    }
    
    // Straight Flush
    if (isFlush && isStraight) {
        return { name: 'Straight Flush', rank: 9, value: 9000000 + uniqueValues[0] };
    }
    
    // Four of a Kind
    if (countGroups[4]) {
        const fourValue = countGroups[4][0];
        const kicker = countGroups[1] ? countGroups[1][0] : 0;
        return { name: 'Quadra', rank: 8, value: 8000000 + fourValue * 1000 + kicker };
    }
    
    // Full House (3 + 2)
    if (countGroups[3] && countGroups[2]) {
        const threeValue = countGroups[3][0];
        const pairValue = countGroups[2][0];
        return { name: 'Full House', rank: 7, value: 7000000 + threeValue * 1000 + pairValue };
    }
    
    // Flush
    if (isFlush) {
        const flushValue = uniqueValues.slice(0, 5).reduce((sum, val, idx) => {
            return sum + val * Math.pow(100, 4 - idx);
        }, 0);
        return { name: 'Flush', rank: 6, value: 6000000 + flushValue };
    }
    
    // Straight
    if (isStraight) {
        return { name: 'Sequência', rank: 5, value: 5000000 + uniqueValues[0] };
    }
    
    // Three of a Kind
    if (countGroups[3]) {
        const threeValue = countGroups[3][0];
        const kickers = countGroups[1] ? countGroups[1].slice(0, 2) : [0, 0];
        return { name: 'Trinca', rank: 4, value: 4000000 + threeValue * 10000 + kickers[0] * 100 + (kickers[1] || 0) };
    }
    
    // Two Pair
    if (countGroups[2] && countGroups[2].length >= 2) {
        const pairs = countGroups[2].slice(0, 2);
        const kicker = countGroups[1] ? countGroups[1][0] : 0;
        return { name: 'Dois Pares', rank: 3, value: 3000000 + pairs[0] * 10000 + pairs[1] * 100 + kicker };
    }
    
    // One Pair
    if (countGroups[2]) {
        const pairValue = countGroups[2][0];
        const kickers = countGroups[1] ? countGroups[1].slice(0, 3) : [0, 0, 0];
        return { 
            name: 'Par', 
            rank: 2, 
            value: 2000000 + pairValue * 100000 + (kickers[0] || 0) * 1000 + (kickers[1] || 0) * 100 + (kickers[2] || 0)
        };
    }
    
    // High Card
    const highCards = uniqueValues.slice(0, 5);
    const highCardValue = highCards.reduce((sum, val, idx) => {
        return sum + val * Math.pow(100, 4 - idx);
    }, 0);
    
    return { 
        name: 'Carta Alta', 
        rank: 1, 
        value: 1000000 + highCardValue
    };
}

function checkStraight(values) {
    if (values.length < 5) return false;
    
    // Verifica sequência normal
    for (let i = 0; i < values.length - 4; i++) {
        let consecutive = true;
        for (let j = 0; j < 4; j++) {
            if (values[i + j] - values[i + j + 1] !== 1) {
                consecutive = false;
                break;
            }
        }
        if (consecutive) return true;
    }
    
    // Verifica sequência baixa A-2-3-4-5
    if (values.includes(14) && values.includes(5) && values.includes(4) && values.includes(3) && values.includes(2)) {
        return true;
    }
    
    return false;
}

function isRoyalFlush(cards) {
    return isStraightFlush(cards) && cards[0].value === 14; // Ás
}

function isStraightFlush(cards) {
    return isFlush(cards) && isStraight(cards);
}

function isFourOfAKind(cards) {
    const ranks = cards.map(c => c.value);
    return ranks.some(rank => ranks.filter(r => r === rank).length === 4);
}

function isFullHouse(cards) {
    const ranks = cards.map(c => c.value);
    const uniqueRanks = [...new Set(ranks)];
    if (uniqueRanks.length !== 2) return false;
    
    return uniqueRanks.every(rank => {
        const count = ranks.filter(r => r === rank).length;
        return count === 3 || count === 2;
    });
}

function isFlush(cards) {
    const suits = cards.map(c => c.suit);
    return suits.some(suit => suits.filter(s => s === suit).length >= 5);
}

function isStraight(cards) {
    const values = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);
    if (values.length < 5) return false;
    
    // Verifica sequência normal
    for (let i = 0; i <= values.length - 5; i++) {
        let isSeq = true;
        for (let j = 0; j < 4; j++) {
            if (values[i + j] - values[i + j + 1] !== 1) {
                isSeq = false;
                break;
            }
        }
        if (isSeq) return true;
    }
    
    // Verifica sequência com Ás baixo (A-2-3-4-5)
    if (values.includes(14) && values.includes(5) && values.includes(4) && values.includes(3) && values.includes(2)) {
        return true;
    }
    
    return false;
}

function isThreeOfAKind(cards) {
    const ranks = cards.map(c => c.value);
    return ranks.some(rank => ranks.filter(r => r === rank).length === 3);
}

function isTwoPair(cards) {
    const ranks = cards.map(c => c.value);
    const pairs = [...new Set(ranks)].filter(rank => ranks.filter(r => r === rank).length === 2);
    return pairs.length >= 2;
}

function isPair(cards) {
    const ranks = cards.map(c => c.value);
    return ranks.some(rank => ranks.filter(r => r === rank).length === 2);
}

function calculateMultiplayerWinProbability(playerCards, communityCards, numPlayers) {
    // Simulação básica de probabilidade contra múltiplos oponentes
    if (communityCards.length === 0) {
        // Pre-flop - usa tabela aproximada baseada nas cartas e número de oponentes
        return calculatePreFlopMultiplayerProbability(playerCards, numPlayers);
    }
    
    // Pós-flop - simulação Monte Carlo simplificada
    const allCards = [...playerCards, ...communityCards];
    const bestHand = evaluateHand(allCards);
    
    // Probabilidade base baseada na força da mão atual
    const baseProbability = {
        10: 95, // Royal Flush
        9: 90,  // Straight Flush
        8: 85,  // Quadra
        7: 80,  // Full House
        6: 70,  // Flush
        5: 60,  // Sequência
        4: 50,  // Trinca
        3: 35,  // Dois Pares
        2: 25,  // Par
        1: 15   // Carta Alta
    };
    
    let probability = baseProbability[bestHand.rank] || 15;
    
    // Ajusta baseado no número de oponentes (mais oponentes = menor chance de vitória)
    const opponentFactor = Math.pow(0.85, numPlayers - 1);
    probability *= opponentFactor;
    
    // Ajusta baseado no número de cartas restantes
    const cardsToReveal = 5 - communityCards.length;
    if (cardsToReveal > 0) {
        probability *= (1 - cardsToReveal * 0.05); // Reduz probabilidade para cartas futuras
    }
    
    return Math.max(1, Math.min(95, probability));
}

function calculatePreFlopMultiplayerProbability(playerCards, numPlayers) {
    const [card1, card2] = playerCards;
    
    let baseProbability = 0;
    
    // Par de bolso
    if (card1.value === card2.value) {
        if (card1.value >= 13) baseProbability = 85; // AA, KK
        else if (card1.value >= 11) baseProbability = 80; // QQ, JJ
        else if (card1.value >= 9) baseProbability = 70; // TT, 99
        else if (card1.value >= 7) baseProbability = 60; // 88, 77
        else baseProbability = 45; // Pares baixos
    }
    // Cartas do mesmo naipe (suited)
    else if (card1.suit === card2.suit) {
        if ((card1.value === 14 && card2.value >= 10) || (card2.value === 14 && card1.value >= 10)) {
            baseProbability = 75; // A-K, A-Q, A-J, A-T suited
        } else if (card1.value >= 10 && card2.value >= 10) {
            baseProbability = 65; // Suited premium
        } else if (Math.abs(card1.value - card2.value) <= 3 && Math.min(card1.value, card2.value) >= 7) {
            baseProbability = 55; // Suited conectores médios
        } else if (card1.value + card2.value >= 18) {
            baseProbability = 50; // Suited bom
        } else {
            baseProbability = 40; // Suited fraco
        }
    }
    // Cartas diferentes (offsuit)
    else {
        if ((card1.value === 14 && card2.value >= 12) || (card2.value === 14 && card1.value >= 12)) {
            baseProbability = 70; // A-K, A-Q offsuit
        } else if ((card1.value === 14 && card2.value >= 10) || (card2.value === 14 && card1.value >= 10)) {
            baseProbability = 60; // A-J, A-T offsuit
        } else if (card1.value >= 12 && card2.value >= 12) {
            baseProbability = 65; // K-Q offsuit
        } else if (card1.value >= 10 && card2.value >= 10) {
            baseProbability = 55; // Offsuit premium
        } else if (card1.value + card2.value >= 20) {
            baseProbability = 40; // Offsuit bom
        } else {
            baseProbability = 30; // Offsuit fraco
        }
    }
    
    // Ajusta baseado no número de oponentes (fórmula mais realística)
    const opponentFactor = Math.pow(0.85, numPlayers - 1);
    baseProbability *= opponentFactor;
    
    return Math.max(5, Math.min(90, baseProbability));
}

function calculateAccurateWinProbability(playerCards, communityCards, numPlayers) {
    if (communityCards.length === 0) {
        return calculatePreFlopMultiplayerProbability(playerCards, numPlayers);
    }
    
    const allCards = [...playerCards, ...communityCards];
    const bestHand = evaluateHand(allCards);
    
    // Tabela de probabilidades mais realística baseada na força da mão
    const handStrengthProbabilities = {
        10: 98, // Royal Flush
        9: 95,  // Straight Flush
        8: 90,  // Quadra
        7: 85,  // Full House
        6: 75,  // Flush
        5: 65,  // Sequência
        4: 55,  // Trinca
        3: 40,  // Dois Pares
        2: 30,  // Par
        1: 20   // Carta Alta
    };
    
    let probability = handStrengthProbabilities[bestHand.rank] || 20;
    
    // Ajusta baseado no número de oponentes
    const opponentFactor = Math.pow(0.88, numPlayers - 1);
    probability *= opponentFactor;
    
    // Ajusta baseado no número de cartas restantes (outs)
    const cardsToReveal = 5 - communityCards.length;
    if (cardsToReveal > 0) {
        // Reduz probabilidade se ainda há cartas para revelar
        const uncertainty = 1 - (cardsToReveal * 0.08);
        probability *= uncertainty;
    }
    
    // Ajuste adicional para mãos específicas
    if (bestHand.rank === 2) { // Par
        const pairValue = getPairValue(allCards);
        if (pairValue >= 13) probability *= 1.2; // Par alto
        else if (pairValue <= 8) probability *= 0.8; // Par baixo
    }
    
    return Math.max(2, Math.min(95, probability));
}

function getPairValue(cards) {
    const ranks = cards.map(c => c.value);
    const rankCounts = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    for (let rank in rankCounts) {
        if (rankCounts[rank] >= 2) {
            return parseInt(rank);
        }
    }
    return 0;
}



function calculateOuts(playerCards, communityCards) {
    if (communityCards.length === 0 || communityCards.length >= 5) {
        return '--';
    }
    
    const allCards = [...playerCards, ...communityCards];
    const availableCards = getAvailableCards();
    let outs = 0;
    
    const currentHand = evaluateHand(allCards);
    
    // Simula cada carta disponível para ver se melhora a mão
    for (let card of availableCards.slice(0, 25)) { // Aumenta um pouco o limite
        const testCards = [...allCards, card];
        const testHand = evaluateHand(testCards);
        
        if (testHand.rank > currentHand.rank) {
            outs++;
        }
    }
    
    return outs;
}
