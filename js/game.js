console.log('Game.js loaded');

// Constants
const COLUMNS = 5;
const ROWS = 10;
const CARD_WIDTH = 60;
const CARD_HEIGHT = 80;
const CANVAS_WIDTH = COLUMNS * CARD_WIDTH;
const CANVAS_HEIGHT = ROWS * CARD_HEIGHT;
const INITIAL_FALL_SPEED = 1000; // 1 second
const SPEED_INCREASE_FACTOR = 0.95;

// Card class
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() {
        return `${this.value}${this.suit}`;
    }
}

// Deck class
class Deck {
    constructor(numberOfDecks = 10) {
        this.cards = [];
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.initializeDeck(numberOfDecks);
    }

    initializeDeck(numberOfDecks) {
        for (let i = 0; i < numberOfDecks; i++) {
            for (let suit of this.suits) {
                for (let value of this.values) {
                    this.cards.push(new Card(suit, value));
                }
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard() {
        if (this.cards.length === 0) return null;
        return this.cards.pop();
    }
	drawUniqueCard(existingCards) {
        if (this.cards.length === 0) return null;
        
        // Convert existing cards to string representation for easier comparison
        const existingCardStrings = existingCards.map(card => 
            card ? `${card.value}${card.suit}` : '').filter(card => card !== '');

        // Try to find a card that's not already on the board
        let attempts = 0;
        const maxAttempts = this.cards.length;
        
        while (attempts < maxAttempts) {
            const index = Math.floor(Math.random() * this.cards.length);
            const candidateCard = this.cards[index];
            const cardString = `${candidateCard.value}${candidateCard.suit}`;
            
            if (!existingCardStrings.includes(cardString)) {
                // Remove the card from this position and return it
                this.cards.splice(index, 1);
                return candidateCard;
            }
            attempts++;
        }
        
        return null; // No unique card found
    }
	drawUniqueCard(existingCards) {
        if (this.cards.length === 0) return null;

        // Convert existing cards to string representation for easier comparison
        const existingCardStrings = existingCards.map(card => 
            card ? `${card.value}${card.suit}` : '').filter(card => card !== '');

        // Try to find a unique card
        let attempts = 0;
        const maxAttempts = this.cards.length;

        while (attempts < maxAttempts) {
            const index = Math.floor(Math.random() * this.cards.length);
            const candidateCard = this.cards[index];
            const cardString = `${candidateCard.value}${candidateCard.suit}`;

            if (!existingCardStrings.includes(cardString)) {
                // Remove and return the card at this position
                this.cards.splice(index, 1);
                return candidateCard;
            }
            attempts++;
        }

        return null; // No unique card found
    }
}
// Poker Hand Evaluator class
class PokerHandEvaluator {
    static cardValue(value) {
        const valueMap = {
            'A': 14, 'K': 13, 'Q': 12, 'J': 11,
            '10': 10, '9': 9, '8': 8, '7': 7,
            '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
        };
        return valueMap[value];
    }

    static evaluateRow(cards) {
        if (cards.includes(null)) return { type: null, score: 0 };
        
        // Sort cards by value
        const sortedCards = [...cards].sort((a, b) => 
            this.cardValue(b.value) - this.cardValue(a.value)
        );

        // Check for different poker hands
        if (this.isRoyalFlush(sortedCards)) return { type: 'Royal Flush', score: 10000 };
        if (this.isStraightFlush(sortedCards)) return { type: 'Straight Flush', score: 8000 };
        if (this.isFourOfAKind(sortedCards)) return { type: 'Four of a Kind', score: 6000 };
        if (this.isFullHouse(sortedCards)) return { type: 'Full House', score: 4000 };
        if (this.isFlush(sortedCards)) return { type: 'Flush', score: 3000 };
        if (this.isStraight(sortedCards)) return { type: 'Straight', score: 2500 };
        if (this.isThreeOfAKind(sortedCards)) return { type: 'Three of a Kind', score: 2000 };
        if (this.isTwoPair(sortedCards)) return { type: 'Two Pair', score: 1500 };
        if (this.isOnePair(sortedCards)) return { type: 'One Pair', score: 1000 };
        
        return { type: null, score: 0 };
    }

    static isRoyalFlush(cards) {
        return this.isStraightFlush(cards) && 
               this.cardValue(cards[0].value) === 14; // Ace high
    }

    static isStraightFlush(cards) {
        return this.isFlush(cards) && this.isStraight(cards);
    }

    static isFourOfAKind(cards) {
        const counts = this.getValueCounts(cards);
        return Object.values(counts).includes(4);
    }

    static isFullHouse(cards) {
        const counts = this.getValueCounts(cards);
        const values = Object.values(counts);
        return values.includes(3) && values.includes(2);
    }

    static isFlush(cards) {
        return cards.every(card => card.suit === cards[0].suit);
    }

    static isStraight(cards) {
        const values = cards.map(card => this.cardValue(card.value));
        for (let i = 1; i < values.length; i++) {
            if (values[i-1] !== values[i] + 1) return false;
        }
        return true;
    }

    static isThreeOfAKind(cards) {
        const counts = this.getValueCounts(cards);
        return Object.values(counts).includes(3);
    }

    static isTwoPair(cards) {
        const counts = this.getValueCounts(cards);
        return Object.values(counts).filter(count => count === 2).length === 2;
    }

    static isOnePair(cards) {
        const counts = this.getValueCounts(cards);
        return Object.values(counts).includes(2);
    }

    static getValueCounts(cards) {
        const counts = {};
        cards.forEach(card => {
            counts[card.value] = (counts[card.value] || 0) + 1;
        });
        return counts;
    }
	static evaluateRow(cards) {
        if (cards.includes(null)) return { type: null, score: 0 };
        
        console.log('Evaluating hand:', cards.map(card => `${card.value}${card.suit}`));
        
        // Check for different poker hands
        if (this.isRoyalFlush(cards)) return { type: 'Royal Flush', score: 10000 };
        if (this.isStraightFlush(cards)) return { type: 'Straight Flush', score: 8000 };
        if (this.isFourOfAKind(cards)) return { type: 'Four of a Kind', score: 6000 };
        if (this.isFullHouse(cards)) return { type: 'Full House', score: 4000 };
        if (this.isFlush(cards)) return { type: 'Flush', score: 3000 };
        if (this.isStraight(cards)) return { type: 'Straight', score: 2500 };
        if (this.isThreeOfAKind(cards)) {
            console.log('Three of a Kind detected!');
            return { type: 'Three of a Kind', score: 2000 };
        }
        if (this.isTwoPair(cards)) return { type: 'Two Pair', score: 1500 };
        if (this.isOnePair(cards)) return { type: 'One Pair', score: 1000 };
        
        return { type: null, score: 0 };
    }
	static isStraight(cards) {
        // Convert card values to numbers and sort them
        const values = cards.map(card => this.cardValue(card.value))
                          .sort((a, b) => a - b);

        // Check if it's a regular straight
        if (this.isConsecutive(values)) {
            return true;
        }

        // Check for Ace-low straight (A,2,3,4,5)
        if (values[4] === 14) { // If we have an Ace
            const aceLowValues = [...values.slice(0, 4), 1];
            return this.isConsecutive(aceLowValues.sort((a, b) => a - b));
        }

        return false;
    }

    static isConsecutive(values) {
        // Check if all values are consecutive
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== values[i-1] + 1) {
                return false;
            }
        }
        return true;
    }

    static isStraightFlush(cards) {
        return this.isFlush(cards) && this.isStraight(cards);
    }

    static evaluateRow(cards) {
        if (cards.includes(null)) return { type: null, score: 0 };
        
        // Convert to array if not already
        const cardArray = Array.from(cards);
        
        console.log('Evaluating hand:', cardArray.map(card => `${card.value}${card.suit}`));
        
        // Sort cards by value for easier evaluation
        cardArray.sort((a, b) => this.cardValue(b.value) - this.cardValue(a.value));

        // Check for different poker hands
        if (this.isRoyalFlush(cardArray)) {
            console.log('Found Royal Flush');
            return { type: 'Royal Flush', score: 10000 };
        }
        if (this.isStraightFlush(cardArray)) {
            console.log('Found Straight Flush');
            return { type: 'Straight Flush', score: 8000 };
        }
        if (this.isFourOfAKind(cardArray)) {
            console.log('Found Four of a Kind');
            return { type: 'Four of a Kind', score: 6000 };
        }
        if (this.isFullHouse(cardArray)) {
            console.log('Found Full House');
            return { type: 'Full House', score: 4000 };
        }
        if (this.isFlush(cardArray)) {
            console.log('Found Flush');
            return { type: 'Flush', score: 3000 };
        }
        if (this.isStraight(cardArray)) {
            console.log('Found Straight');
            return { type: 'Straight', score: 2500 };
        }
        if (this.isThreeOfAKind(cardArray)) {
            console.log('Found Three of a Kind');
            return { type: 'Three of a Kind', score: 2000 };
        }
        if (this.isTwoPair(cardArray)) {
            console.log('Found Two Pair');
            return { type: 'Two Pair', score: 1500 };
        }
        if (this.isOnePair(cardArray)) {
            console.log('Found One Pair');
            return { type: 'One Pair', score: 1000 };
        }
        
        return { type: null, score: 0 };
    }	
}

// Game Board class
class GameBoard {
    constructor() {
        this.grid = Array(ROWS).fill().map(() => Array(COLUMNS).fill(null));
        this.currentCard = null;
        this.currentX = 2;
        this.currentY = 0;
    }

    isValidMove(x, y) {
        return x >= 0 && x < COLUMNS && y >= 0 && y < ROWS && !this.grid[y][x];
    }

    placeCard() {
        if (this.currentCard && this.isValidMove(this.currentX, this.currentY)) {
            this.grid[this.currentY][this.currentX] = this.currentCard;
            return true;
        }
        return false;
    }
	getAllCards() {
        const cards = [];
        // Get cards from the grid
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLUMNS; x++) {
                if (this.grid[y][x]) {
                    cards.push(this.grid[y][x]);
                }
            }
        }
        // Add current falling card if it exists
        if (this.currentCard) {
            cards.push(this.currentCard);
        }
        return cards;
    }

    isGameOver() {
        // Check if any column is full
        for (let x = 0; x < COLUMNS; x++) {
            if (this.grid[0][x] !== null) {
                return true;
            }
        }
        return false;
    }

    checkForCompletedHands() {
        let completedRows = [];
        let totalScore = 0;

        // Check each row
        for (let y = ROWS - 1; y >= 0; y--) {
            const row = this.grid[y];
            if (!row.includes(null)) {  // Check if row is full
                const result = PokerHandEvaluator.evaluateRow(row);
                console.log('Checking row:', y, 'Cards:', row.map(card => `${card.value}${card.suit}`));
                console.log('Hand found:', result.type);
                
                if (result.type) {
                    completedRows.push(y);
                    totalScore += result.score;
                }
            }
        }

        // Apply combo bonus if multiple rows are completed
        if (completedRows.length > 1) {
            console.log('Combo bonus applied!');
            totalScore *= 2;
        }

        // Remove completed rows immediately if any were found
        if (completedRows.length > 0) {
            console.log('Removing completed rows:', completedRows);
            this.removeCompletedRows(completedRows);
        }

        return totalScore;
    }

    removeCompletedRows(completedRows) {
        // Sort rows in descending order to remove from bottom to top
        completedRows.sort((a, b) => b - a);
        
        for (let row of completedRows) {
            // Remove the completed row
            this.grid.splice(row, 1);
            // Add new empty row at top
            this.grid.unshift(Array(COLUMNS).fill(null));
        }

        // Ensure all cards above fall down to fill any gaps
        this.applyGravity();
    }

    applyGravity() {
        // Move all cards down if there's empty space below them
        for (let x = 0; x < COLUMNS; x++) {
            for (let y = ROWS - 2; y >= 0; y--) {
                if (this.grid[y][x] !== null) {
                    let newY = y;
                    // Find the lowest empty space below this card
                    while (newY + 1 < ROWS && this.grid[newY + 1][x] === null) {
                        newY++;
                    }
                    // If we found a lower position, move the card there
                    if (newY !== y) {
                        this.grid[newY][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                }
            }
        }
    }
}

// Game class
import { firebaseService } from './firebase-service.js';

export class Game {
    constructor() {
        // Button setup
        this.newGameButton = document.getElementById('new-game-button');
        this.newGameButton.addEventListener('click', () => this.restart());
        this.newGameButton.style.display = 'none';

        // Store bound event handler for later removal
        this.boundKeyPressHandler = this.handleKeyPress.bind(this);

        // Start first game
        this.initialize();
		
		this.setupAuthUI();
        this.loadHighScores();
    }

    setupAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        loginBtn.addEventListener('click', async () => {
            if (firebaseService.currentUser) {
                await firebaseService.signOut();
            } else {
                await firebaseService.signInWithGoogle();
            }
        });
    }

    async saveScore() {
        if (firebaseService.currentUser) {
            await firebaseService.saveScore(this.score, this.difficulty);
            await this.loadHighScores();
        }
    }

    async loadHighScores() {
        const scores = await firebaseService.getTopScores();
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = scores
            .map(score => `
                <div class="score-entry">
                    <span>${score.userName}</span>
                    <span>${score.score}</span>
                    <span>${new Date(score.timestamp).toLocaleDateString()}</span>
                </div>
            `)
            .join('');
    }
    }

    initialize() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCardCanvas = document.getElementById('next-card');
        this.nextCardCtx = this.nextCardCanvas.getContext('2d');

        // Set canvas dimensions
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.nextCardCanvas.width = CARD_WIDTH;
        this.nextCardCanvas.height = CARD_HEIGHT * 3 + 20;

        // Game objects
        this.board = new GameBoard();
        this.deck = new Deck(10);
        this.deck.shuffle();

        // Game state
        this.score = 0;
        this.gameOver = false;
        this.fallSpeed = INITIAL_FALL_SPEED;
        this.lastFallTime = 0;
        
        // Initialize next cards array
        this.nextCards = [];
        for (let i = 0; i < 3; i++) {
            this.nextCards.push(this.deck.drawCard());
        }
        
        // Set up input handlers and start game
        this.setupInputHandlers();
        this.spawnNewCard();
        requestAnimationFrame(this.gameLoop.bind(this));

        // Reset score display
        document.getElementById('score').textContent = 'Score: 0';
    }

    setupInputHandlers() {
        // Remove existing event listener if it exists
        document.removeEventListener('keydown', this.boundKeyPressHandler);
        // Add new event listener
        document.addEventListener('keydown', this.boundKeyPressHandler);
    }

    restart() {
        // Hide the new game button
        this.newGameButton.style.display = 'none';
        
        // Clear both canvases
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.nextCardCtx.clearRect(0, 0, CARD_WIDTH, this.nextCardCanvas.height);
        
        // Reinitialize the game
        this.initialize();
    }

    
    handleKeyPress(event) {
        if (this.gameOver) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.moveCurrentCard(-1);
                break;
            case 'ArrowRight':
                this.moveCurrentCard(1);
                break;
            case 'ArrowDown':
                this.fastDrop();
                break;
            case ' ': // Space bar
                this.instantDrop();
                break;
        }
    }

    moveCurrentCard(direction) {
        const newX = this.board.currentX + direction;
        if (this.board.isValidMove(newX, this.board.currentY)) {
            this.board.currentX = newX;
        }
    }

    fastDrop() {
        this.lastFallTime -= this.fallSpeed / 2;
    }

    instantDrop() {
        while (this.board.isValidMove(this.board.currentX, this.board.currentY + 1)) {
            this.board.currentY++;
        }
        this.board.placeCard();
        this.checkAndUpdateScore();
        if (!this.gameOver) {
            this.spawnNewCard();
        }
    }

    spawnNewCard() {
        this.board.currentCard = this.nextCards[0];
        this.board.currentX = 2;
        this.board.currentY = 0;

        // Shift the preview cards
        this.nextCards.shift();
        
        // Get all current cards (board + preview)
        const existingCards = [
            ...this.board.getAllCards(),
            ...this.nextCards.filter(card => card !== null)
        ];

        // Add a new unique card to preview
        const newCard = this.deck.drawUniqueCard(existingCards);
        if (newCard) {
            this.nextCards.push(newCard);
        }

        // Check for game over conditions
        if (this.isGameOver()) {
            this.gameOver = true;
            this.GameOver();
        }
    }

    isGameOver() {
        // Check if there are no more cards in the deck
        if (this.nextCards.includes(null)) {
            return true;
        }

        // Check if the current card can't be placed
        if (!this.board.isValidMove(this.board.currentX, 0)) {
            return true;
        }

        // Check if any column is full
        for (let x = 0; x < COLUMNS; x++) {
            if (this.board.grid[0][x] !== null) {
                return true;
            }
        }

        return false;
    }

    checkAndUpdateScore() {
        const roundScore = this.board.checkForCompletedHands();
        if (roundScore > 0) {
            this.score += roundScore;
            document.getElementById('score').textContent = `Score: ${this.score}`;
        }
        // Check and replace any duplicates in preview cards
        this.checkAndReplacePreviewDuplicates();
    }

    gameLoop(currentTime) {
        this.update(currentTime);
        this.draw();

        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    update(currentTime) {
        if (this.gameOver) return;

        if (currentTime - this.lastFallTime >= this.fallSpeed) {
            this.lastFallTime = currentTime;
            
            if (this.board.isValidMove(this.board.currentX, this.board.currentY + 1)) {
                this.board.currentY++;
            } else {
                this.board.placeCard();
                this.checkAndUpdateScore();
                if (!this.gameOver) {
                    this.spawnNewCard();
                }
            }
        }
    }

    draw() {
        // Clear canvases
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.nextCardCtx.clearRect(0, 0, CARD_WIDTH, this.nextCardCanvas.height);

        // Draw grid
        this.drawGrid();

        // Draw placed cards
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLUMNS; x++) {
                if (this.board.grid[y][x]) {
                    this.drawCard(this.board.grid[y][x], x * CARD_WIDTH, y * CARD_HEIGHT);
                }
            }
        }

        // Draw current card
        if (this.board.currentCard) {
            this.drawCard(
                this.board.currentCard,
                this.board.currentX * CARD_WIDTH,
                this.board.currentY * CARD_HEIGHT
            );
        }

        // Draw next cards preview
        for (let i = 0; i < this.nextCards.length; i++) {
            if (this.nextCards[i]) {
                this.drawCard(
                    this.nextCards[i],
                    0,
                    i * (CARD_HEIGHT + 5),
                    this.nextCardCtx
                );
            }
        }

        // Draw game over screen if game is over
        if (this.gameOver) {
            this.gameOver();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= CANVAS_WIDTH; x += CARD_WIDTH) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        for (let y = 0; y <= CANVAS_HEIGHT; y += CARD_HEIGHT) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    drawCard(card, x, y, context = this.ctx) {
        // Draw card background
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.fillRect(x + 2, y + 2, CARD_WIDTH - 4, CARD_HEIGHT - 4);
        context.strokeRect(x + 2, y + 2, CARD_WIDTH - 4, CARD_HEIGHT - 4);

        // Draw card value and suit
        context.fillStyle = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw value
        context.fillText(card.value, x + CARD_WIDTH / 2, y + CARD_HEIGHT / 3);
        
        // Draw suit
        context.fillText(card.suit, x + CARD_WIDTH / 2, y + CARD_HEIGHT * 2/3);
    }

    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Game Over text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        
        // Final score
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        // Show the new game button
        this.newGameButton.style.display = 'block';
		
		// Add this new method
        async gameOver() {
        this.gameOver = true;
        await this.saveScore();
        this.drawGameOver();
    }
    }
	checkAndReplacePreviewDuplicates() {
        // Get all cards currently on the board
        const boardCards = this.board.getAllCards();
        
        // Check each preview card for duplicates and replace if necessary
        for (let i = 0; i < this.nextCards.length; i++) {
            const previewCard = this.nextCards[i];
            if (!previewCard) continue;

            // Check if this preview card exists on the board
            const isDuplicate = boardCards.some(boardCard => 
                boardCard && 
                boardCard.value === previewCard.value && 
                boardCard.suit === previewCard.suit
            );

            if (isDuplicate) {
                console.log(`Found duplicate card in preview: ${previewCard.value}${previewCard.suit}`);
                // Draw a new unique card
                let newCard;
                let attempts = 0;
                const maxAttempts = 52; // Maximum number of attempts to find a unique card

                do {
                    newCard = this.deck.drawCard();
                    if (newCard) {
                        // Check if new card is unique compared to board and other preview cards
                        const isNewCardDuplicate = [...boardCards, ...this.nextCards].some(existingCard => 
                            existingCard && 
                            existingCard.value === newCard.value && 
                            existingCard.suit === newCard.suit &&
                            existingCard !== previewCard // Don't compare with the card we're replacing
                        );

                        if (isNewCardDuplicate) {
                            // Put the card back in the deck
                            this.deck.cards.unshift(newCard);
                            newCard = null;
                        }
                    }
                    attempts++;
                } while (!newCard && attempts < maxAttempts);

                if (newCard) {
                    this.nextCards[i] = newCard;
                    console.log(`Replaced with new card: ${newCard.value}${newCard.suit}`);
                }
            }
        }
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
});