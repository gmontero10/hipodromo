// Derby Dreams - Horse Racing Simulation
// Game State
const gameState = {
    balance: 100,
    raceNumber: 1,
    totalRaces: 0,
    totalWon: 0,
    totalLost: 0,
    horses: [],
    bets: [],
    selectedBetType: 'win',
    selectedHorse: null,
    selectedSecondHorse: null,
    betAmount: 0,
    isRacing: false,
    raceResults: []
};

// Horse name data
const horseNames = {
    prefixes: ['Thunder', 'Lightning', 'Storm', 'Golden', 'Silver', 'Midnight', 'Royal', 'Wild', 'Lucky', 'Swift', 'Blazing', 'Iron', 'Steel', 'Diamond', 'Shadow', 'Mystic', 'Noble', 'Brave', 'Bold', 'Fierce'],
    suffixes: ['Runner', 'Dancer', 'Spirit', 'Dream', 'Star', 'Wind', 'Fire', 'Flash', 'Strike', 'Glory', 'Champion', 'Legend', 'Prince', 'Knight', 'Arrow', 'Bolt', 'Blaze', 'Storm', 'Heart', 'Soul']
};

const jockeyNames = [
    'J. Smith', 'M. Johnson', 'R. Garcia', 'T. Williams', 'D. Brown',
    'C. Davis', 'A. Martinez', 'L. Anderson', 'K. Thomas', 'P. Jackson',
    'S. White', 'N. Harris', 'B. Martin', 'E. Thompson', 'F. Robinson'
];

const raceNames = [
    'Maiden Stakes', 'Sprint Classic', 'Derby Trial', 'Championship Cup',
    'Golden Mile', 'Thunder Run', 'Crown Jewel', 'Victory Stakes',
    'Premier Handicap', 'Grand Prix', 'Legend Chase', 'Elite Stakes'
];

const raceDistances = ['5 Furlongs', '6 Furlongs', '7 Furlongs', '1 Mile', '1⅛ Miles'];

// DOM Elements
const elements = {
    balance: document.getElementById('balance'),
    raceName: document.getElementById('raceName'),
    raceDistance: document.getElementById('raceDistance'),
    raceSection: document.getElementById('raceSection'),
    lanes: document.getElementById('lanes'),
    raceStatus: document.getElementById('raceStatus'),
    horsesList: document.getElementById('horsesList'),
    horseButtons: document.getElementById('horseButtons'),
    secondHorseButtons: document.getElementById('secondHorseButtons'),
    horseSelection: document.getElementById('horseSelection'),
    secondHorseSelection: document.getElementById('secondHorseSelection'),
    betAmount: document.getElementById('betAmount'),
    potentialPayout: document.getElementById('potentialPayout'),
    betsList: document.getElementById('betsList'),
    totalWagered: document.getElementById('totalWagered'),
    activeBets: document.getElementById('activeBets'),
    addBetBtn: document.getElementById('addBetBtn'),
    startRaceBtn: document.getElementById('startRaceBtn'),
    clearBetsBtn: document.getElementById('clearBetsBtn'),
    resultsModal: document.getElementById('resultsModal'),
    resultsPodium: document.getElementById('resultsPodium'),
    winningsDisplay: document.getElementById('winningsDisplay'),
    modalTitle: document.getElementById('modalTitle'),
    nextRaceBtn: document.getElementById('nextRaceBtn'),
    resetGameBtn: document.getElementById('resetGameBtn'),
    gameOverModal: document.getElementById('gameOverModal'),
    gameOverStats: document.getElementById('gameOverStats'),
    restartBtn: document.getElementById('restartBtn')
};

// Generate unique horse name
function generateHorseName(usedNames) {
    let name;
    do {
        const prefix = horseNames.prefixes[Math.floor(Math.random() * horseNames.prefixes.length)];
        const suffix = horseNames.suffixes[Math.floor(Math.random() * horseNames.suffixes.length)];
        name = `${prefix} ${suffix}`;
    } while (usedNames.includes(name));
    return name;
}

// Generate horses for the race
function generateHorses() {
    const horses = [];
    const usedNames = [];
    const usedJockeys = [];
    const numHorses = 6;

    for (let i = 0; i < numHorses; i++) {
        const name = generateHorseName(usedNames);
        usedNames.push(name);

        let jockey;
        do {
            jockey = jockeyNames[Math.floor(Math.random() * jockeyNames.length)];
        } while (usedJockeys.includes(jockey));
        usedJockeys.push(jockey);

        // Base ability (determines odds and race performance)
        const ability = Math.random() * 60 + 40; // 40-100

        horses.push({
            id: i + 1,
            name,
            jockey,
            ability,
            color: i + 1,
            position: 20, // Starting position in pixels
            finished: false,
            finishTime: 0
        });
    }

    // Calculate odds based on ability
    const totalAbility = horses.reduce((sum, h) => sum + h.ability, 0);
    horses.forEach(horse => {
        // Convert ability to implied probability and then to odds
        const impliedProb = horse.ability / totalAbility;
        const fairOdds = (1 / impliedProb) - 1;
        // Add house edge and round
        horse.odds = Math.max(1.5, Math.round(fairOdds * 10) / 10);
        // Morning line style display
        horse.oddsDisplay = formatOdds(horse.odds);
    });

    // Sort by odds (favorite first)
    horses.sort((a, b) => a.odds - b.odds);

    return horses;
}

// Format odds in traditional style
function formatOdds(decimal) {
    if (decimal < 2) return 'EVS';
    const whole = Math.floor(decimal - 1);
    return `${whole}/1`;
}

// Update balance display
function updateBalance() {
    elements.balance.textContent = `$${gameState.balance.toFixed(2)}`;
}

// Render horse cards
function renderHorses() {
    elements.horsesList.innerHTML = gameState.horses.map(horse => `
        <div class="horse-card" data-horse-id="${horse.id}">
            <div class="horse-number horse-color-${horse.color}">${horse.id}</div>
            <div class="horse-info">
                <div class="horse-name">${horse.name}</div>
                <div class="horse-jockey">🏇 ${horse.jockey}</div>
            </div>
            <div class="horse-odds">
                <div class="odds-value">${horse.oddsDisplay}</div>
                <div class="odds-label">odds</div>
            </div>
        </div>
    `).join('');
}

// Render track lanes
function renderTrack() {
    elements.lanes.innerHTML = gameState.horses.map(horse => `
        <div class="lane" data-lane="${horse.id}">
            <span class="lane-number">${horse.id}</span>
            <span class="horse-icon" id="horse-${horse.id}" style="left: ${horse.position}px;">🏇</span>
        </div>
    `).join('');
}

// Render horse selection buttons
function renderHorseButtons() {
    const buttonsHtml = gameState.horses.map(horse => `
        <button class="horse-select-btn horse-color-${horse.color}" data-horse-id="${horse.id}">
            ${horse.id}
        </button>
    `).join('');

    elements.horseButtons.innerHTML = buttonsHtml;
    elements.secondHorseButtons.innerHTML = buttonsHtml;

    // Add click handlers
    elements.horseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
        btn.addEventListener('click', () => selectHorse(parseInt(btn.dataset.horseId), 'first'));
    });

    elements.secondHorseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
        btn.addEventListener('click', () => selectHorse(parseInt(btn.dataset.horseId), 'second'));
    });
}

// Select horse
function selectHorse(horseId, position) {
    if (position === 'first') {
        gameState.selectedHorse = horseId;
        elements.horseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.horseId) === horseId);
        });

        // Update second horse buttons (disable selected first horse)
        if (gameState.selectedBetType === 'exacta') {
            elements.secondHorseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
                const id = parseInt(btn.dataset.horseId);
                btn.classList.toggle('disabled', id === horseId);
                if (id === horseId && gameState.selectedSecondHorse === id) {
                    gameState.selectedSecondHorse = null;
                    btn.classList.remove('selected');
                }
            });
        }
    } else {
        if (horseId === gameState.selectedHorse) return;
        gameState.selectedSecondHorse = horseId;
        elements.secondHorseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.horseId) === horseId);
        });
    }

    updatePotentialPayout();
}

// Set bet type
function setBetType(type) {
    gameState.selectedBetType = type;
    gameState.selectedSecondHorse = null;

    document.querySelectorAll('.bet-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Show/hide second horse selection
    if (type === 'exacta') {
        elements.secondHorseSelection.classList.remove('hidden');
        // Reset second horse buttons
        elements.secondHorseButtons.querySelectorAll('.horse-select-btn').forEach(btn => {
            const id = parseInt(btn.dataset.horseId);
            btn.classList.toggle('disabled', id === gameState.selectedHorse);
            btn.classList.remove('selected');
        });
    } else {
        elements.secondHorseSelection.classList.add('hidden');
    }

    updatePotentialPayout();
}

// Set bet amount
function setBetAmount(amount) {
    if (amount === 'all') {
        amount = gameState.balance - getTotalWagered();
    }
    gameState.betAmount = Math.min(amount, gameState.balance - getTotalWagered());
    elements.betAmount.value = gameState.betAmount > 0 ? gameState.betAmount : '';

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    updatePotentialPayout();
}

// Calculate potential payout
function calculatePayout(betType, horseId, secondHorseId, amount) {
    const horse = gameState.horses.find(h => h.id === horseId);
    if (!horse || amount <= 0) return 0;

    switch (betType) {
        case 'win':
            return amount * (horse.odds + 1);
        case 'place':
            // Place pays roughly half the win odds
            return amount * (horse.odds / 2 + 1);
        case 'show':
            // Show pays roughly a third of win odds
            return amount * (horse.odds / 3 + 1);
        case 'exacta':
            if (!secondHorseId) return 0;
            const secondHorse = gameState.horses.find(h => h.id === secondHorseId);
            // Exacta multiplies the odds
            return amount * (horse.odds * secondHorse.odds / 2 + 1);
        default:
            return 0;
    }
}

// Update potential payout display
function updatePotentialPayout() {
    const amount = gameState.betAmount || parseFloat(elements.betAmount.value) || 0;
    const payout = calculatePayout(
        gameState.selectedBetType,
        gameState.selectedHorse,
        gameState.selectedSecondHorse,
        amount
    );
    elements.potentialPayout.textContent = `$${payout.toFixed(2)}`;
}

// Get total wagered
function getTotalWagered() {
    return gameState.bets.reduce((sum, bet) => sum + bet.amount, 0);
}

// Add bet
function addBet() {
    const amount = gameState.betAmount || parseFloat(elements.betAmount.value) || 0;

    if (amount <= 0) {
        showStatus('Enter a bet amount!', 'error');
        return;
    }

    if (!gameState.selectedHorse) {
        showStatus('Select a horse!', 'error');
        return;
    }

    if (gameState.selectedBetType === 'exacta' && !gameState.selectedSecondHorse) {
        showStatus('Select 2nd place horse!', 'error');
        return;
    }

    const totalAfterBet = getTotalWagered() + amount;
    if (totalAfterBet > gameState.balance) {
        showStatus('Insufficient balance!', 'error');
        return;
    }

    const horse = gameState.horses.find(h => h.id === gameState.selectedHorse);
    const secondHorse = gameState.selectedSecondHorse
        ? gameState.horses.find(h => h.id === gameState.selectedSecondHorse)
        : null;

    const bet = {
        id: Date.now(),
        type: gameState.selectedBetType,
        horseId: gameState.selectedHorse,
        horseName: horse.name,
        secondHorseId: gameState.selectedSecondHorse,
        secondHorseName: secondHorse?.name,
        amount,
        potentialPayout: calculatePayout(
            gameState.selectedBetType,
            gameState.selectedHorse,
            gameState.selectedSecondHorse,
            amount
        ),
        odds: horse.odds
    };

    gameState.bets.push(bet);
    renderBets();
    showStatus('Bet placed!', 'success');

    // Reset selections
    gameState.betAmount = 0;
    elements.betAmount.value = '';
    updatePotentialPayout();
}

// Remove bet
function removeBet(betId) {
    gameState.bets = gameState.bets.filter(b => b.id !== betId);
    renderBets();
}

// Clear all bets
function clearBets() {
    gameState.bets = [];
    renderBets();
}

// Render bets list
function renderBets() {
    if (gameState.bets.length === 0) {
        elements.betsList.innerHTML = '<p class="no-bets">No bets placed yet</p>';
    } else {
        elements.betsList.innerHTML = gameState.bets.map(bet => `
            <div class="bet-item">
                <div class="bet-details">
                    <span class="bet-type-label">${bet.type.toUpperCase()}</span>
                    <span class="bet-horses">
                        #${bet.horseId} ${bet.horseName}
                        ${bet.secondHorseId ? ` → #${bet.secondHorseId} ${bet.secondHorseName}` : ''}
                    </span>
                </div>
                <span class="bet-amount-display">$${bet.amount.toFixed(2)}</span>
                <button class="bet-remove" onclick="removeBet(${bet.id})">✕</button>
            </div>
        `).join('');
    }

    elements.totalWagered.textContent = `$${getTotalWagered().toFixed(2)}`;
}

// Show status message
function showStatus(message, type = 'info') {
    elements.raceStatus.textContent = message;
    elements.raceStatus.className = 'race-status';
    if (type === 'racing') {
        elements.raceStatus.classList.add('racing');
    }
}

// Start race
async function startRace() {
    if (gameState.isRacing) return;

    if (gameState.bets.length === 0) {
        showStatus('Place at least one bet!', 'error');
        return;
    }

    gameState.isRacing = true;
    elements.startRaceBtn.disabled = true;
    elements.addBetBtn.disabled = true;
    elements.clearBetsBtn.disabled = true;

    // Scroll to track section to watch the race
    elements.raceSection.scrollIntoView({ behavior: 'smooth' });

    // Reset horse positions
    gameState.horses.forEach(horse => {
        horse.position = 20;
        horse.finished = false;
        horse.finishTime = 0;
    });
    renderTrack();

    // Countdown
    for (let i = 3; i > 0; i--) {
        showStatus(`Race starting in ${i}...`);
        await sleep(1000);
    }

    showStatus('🏁 AND THEY\'RE OFF! 🏁', 'racing');

    // Add racing animation class
    document.querySelectorAll('.horse-icon').forEach(el => {
        el.classList.add('racing');
    });

    // Run the race
    await runRace();
}

// Run race simulation
async function runRace() {
    const finishLine = elements.lanes.offsetWidth - 60;
    const raceTime = 5000; // 5 seconds race
    const startTime = Date.now();
    let finishOrder = [];

    return new Promise((resolve) => {
        const raceInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / raceTime, 1);

            gameState.horses.forEach(horse => {
                if (horse.finished) return;

                // Calculate movement based on ability + randomness
                const baseSpeed = (horse.ability / 100) * 0.8 + 0.2;
                const randomFactor = 0.7 + Math.random() * 0.6;
                const speed = baseSpeed * randomFactor;

                // Move horse
                const targetPos = finishLine * progress * speed;
                horse.position = Math.min(20 + targetPos, finishLine);

                // Update visual
                const horseEl = document.getElementById(`horse-${horse.id}`);
                if (horseEl) {
                    horseEl.style.left = `${horse.position}px`;
                }

                // Check if finished
                if (horse.position >= finishLine - 5 && !horse.finished) {
                    horse.finished = true;
                    horse.finishTime = elapsed;
                    finishOrder.push(horse);
                }
            });

            // Check if all horses finished
            if (finishOrder.length >= gameState.horses.length || elapsed >= raceTime + 2000) {
                clearInterval(raceInterval);

                // Ensure all horses are marked finished
                gameState.horses
                    .filter(h => !h.finished)
                    .sort((a, b) => b.position - a.position)
                    .forEach(h => {
                        h.finished = true;
                        h.finishTime = elapsed;
                        finishOrder.push(h);
                    });

                // Remove racing animation
                document.querySelectorAll('.horse-icon').forEach(el => {
                    el.classList.remove('racing');
                });

                gameState.raceResults = finishOrder;
                showStatus('Race finished!');

                setTimeout(() => {
                    showResults();
                    resolve();
                }, 1000);
            }
        }, 50);
    });
}

// Show results
function showResults() {
    const results = gameState.raceResults;

    // Render podium
    elements.resultsPodium.innerHTML = results.slice(0, 3).map((horse, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const places = ['1st', '2nd', '3rd'];
        return `
            <div class="podium-place place-${index + 1}">
                <div class="place-medal">${medals[index]}</div>
                <div class="place-info">
                    <div class="place-horse-name">#${horse.id} ${horse.name}</div>
                    <div class="place-label">${places[index]} Place</div>
                </div>
            </div>
        `;
    }).join('');

    // Calculate winnings
    let totalWinnings = 0;
    const betResults = [];

    gameState.bets.forEach(bet => {
        const won = checkBetWin(bet, results);
        const payout = won ? bet.potentialPayout : 0;
        totalWinnings += payout;

        betResults.push({
            ...bet,
            won,
            payout
        });
    });

    // Render winnings
    const totalWagered = getTotalWagered();
    const netResult = totalWinnings - totalWagered;

    elements.winningsDisplay.innerHTML = `
        ${betResults.map(bet => `
            <div class="winnings-item ${bet.won ? 'winner' : 'loser'}">
                <span>${bet.type.toUpperCase()} #${bet.horseId}${bet.secondHorseId ? `→#${bet.secondHorseId}` : ''}</span>
                <span>${bet.won ? `+$${bet.payout.toFixed(2)}` : `-$${bet.amount.toFixed(2)}`}</span>
            </div>
        `).join('')}
        <div class="winnings-item total">
            <span>Net Result:</span>
            <span style="color: ${netResult >= 0 ? 'var(--success)' : 'var(--danger)'}">
                ${netResult >= 0 ? '+' : ''}$${netResult.toFixed(2)}
            </span>
        </div>
    `;

    // Update balance
    gameState.balance += netResult;
    updateBalance();

    // Flash balance
    elements.balance.classList.add(netResult >= 0 ? 'positive' : 'negative');
    setTimeout(() => {
        elements.balance.classList.remove('positive', 'negative');
    }, 500);

    // Track stats
    gameState.totalRaces++;
    if (netResult > 0) {
        gameState.totalWon += netResult;
    } else {
        gameState.totalLost += Math.abs(netResult);
    }

    // Update modal title
    if (netResult > 0) {
        elements.modalTitle.textContent = '🎉 Winner! 🎉';
    } else if (netResult < 0) {
        elements.modalTitle.textContent = '😢 Better luck next time';
    } else {
        elements.modalTitle.textContent = 'Race Results';
    }

    // Show reset button if balance is low
    elements.resetGameBtn.style.display = gameState.balance < 5 ? 'inline-block' : 'none';

    // Show modal
    elements.resultsModal.classList.add('active');
}

// Check if bet won
function checkBetWin(bet, results) {
    const positions = {};
    results.forEach((horse, index) => {
        positions[horse.id] = index + 1;
    });

    const horsePosition = positions[bet.horseId];

    switch (bet.type) {
        case 'win':
            return horsePosition === 1;
        case 'place':
            return horsePosition <= 2;
        case 'show':
            return horsePosition <= 3;
        case 'exacta':
            return horsePosition === 1 && positions[bet.secondHorseId] === 2;
        default:
            return false;
    }
}

// Next race
function nextRace() {
    if (gameState.balance < 1) {
        showGameOver();
        return;
    }

    elements.resultsModal.classList.remove('active');
    gameState.isRacing = false;
    gameState.bets = [];
    gameState.selectedHorse = null;
    gameState.selectedSecondHorse = null;
    gameState.betAmount = 0;
    gameState.raceNumber++;

    // Generate new race
    initRace();
}

// Initialize race
function initRace() {
    gameState.horses = generateHorses();

    // Update race info
    elements.raceName.textContent = `Race ${gameState.raceNumber} - ${raceNames[Math.floor(Math.random() * raceNames.length)]}`;
    elements.raceDistance.textContent = raceDistances[Math.floor(Math.random() * raceDistances.length)];

    renderHorses();
    renderTrack();
    renderHorseButtons();
    renderBets();
    updatePotentialPayout();

    elements.startRaceBtn.disabled = false;
    elements.addBetBtn.disabled = false;
    elements.clearBetsBtn.disabled = false;

    showStatus('Place your bets!');
}

// Show game over
function showGameOver() {
    elements.resultsModal.classList.remove('active');
    elements.gameOverStats.textContent = `You played ${gameState.totalRaces} races. Total won: $${gameState.totalWon.toFixed(2)}, Total lost: $${gameState.totalLost.toFixed(2)}`;
    elements.gameOverModal.classList.add('active');
}

// Restart game
function restartGame() {
    gameState.balance = 100;
    gameState.raceNumber = 1;
    gameState.totalRaces = 0;
    gameState.totalWon = 0;
    gameState.totalLost = 0;
    gameState.bets = [];
    gameState.isRacing = false;

    updateBalance();
    elements.gameOverModal.classList.remove('active');
    elements.resultsModal.classList.remove('active');
    initRace();
}

// Utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event Listeners
document.querySelectorAll('.bet-type-btn').forEach(btn => {
    btn.addEventListener('click', () => setBetType(btn.dataset.type));
});

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => setBetAmount(btn.dataset.amount === 'all' ? 'all' : parseFloat(btn.dataset.amount)));
});

elements.betAmount.addEventListener('input', (e) => {
    gameState.betAmount = parseFloat(e.target.value) || 0;
    updatePotentialPayout();
});

elements.addBetBtn.addEventListener('click', addBet);
elements.startRaceBtn.addEventListener('click', startRace);
elements.clearBetsBtn.addEventListener('click', clearBets);
elements.nextRaceBtn.addEventListener('click', nextRace);
elements.resetGameBtn.addEventListener('click', restartGame);
elements.restartBtn.addEventListener('click', restartGame);

// Make removeBet available globally
window.removeBet = removeBet;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initRace();
});

// Also initialize immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
    initRace();
}
