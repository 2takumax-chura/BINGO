class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playTickSound(frequency = 800) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    playDrumRoll() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 2.5);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 3);
    }

    playFanfare() {
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.5];
        const startTime = this.audioContext.currentTime;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'square';
            
            const noteTime = startTime + index * 0.1;
            gainNode.gain.setValueAtTime(0, noteTime);
            gainNode.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);
            
            oscillator.start(noteTime);
            oscillator.stop(noteTime + 0.3);
        });
    }

    playButtonClick() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
}

class BingoGame {
    constructor() {
        this.maxNumber = 75;
        this.drawnNumbers = new Set();
        this.currentNumber = null;
        this.isDrawing = false;
        this.soundManager = new SoundManager();
        this.init();
    }

    init() {
        this.createBoard();
        this.attachEventListeners();
    }

    createBoard() {
        const board = document.getElementById('bingoBoard');
        board.innerHTML = '';
        
        for (let i = 1; i <= this.maxNumber; i++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = i;
            cell.dataset.number = i;
            board.appendChild(cell);
        }
    }

    attachEventListeners() {
        document.getElementById('drawBall').addEventListener('click', () => this.drawNumber());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
    }

    drawNumber() {
        if (this.isDrawing) return;
        
        if (this.drawnNumbers.size >= this.maxNumber) {
            alert('すべての番号が引かれました！');
            return;
        }

        this.soundManager.playButtonClick();
        this.isDrawing = true;
        const drawButton = document.getElementById('drawBall');
        drawButton.disabled = true;

        let finalNumber;
        do {
            finalNumber = Math.floor(Math.random() * this.maxNumber) + 1;
        } while (this.drawnNumbers.has(finalNumber));

        this.soundManager.playDrumRoll();
        
        this.startRouletteAnimation(finalNumber, () => {
            this.currentNumber = finalNumber;
            this.drawnNumbers.add(finalNumber);
            
            this.soundManager.playFanfare();
            this.markNumber(finalNumber);
            this.updateDrawnNumbersList();
            this.celebrateNumber(finalNumber);
            
            this.isDrawing = false;
            drawButton.disabled = false;
            
            if (this.drawnNumbers.size === this.maxNumber) {
                setTimeout(() => {
                    alert('🎊 ゲーム終了！すべての番号が引かれました！ 🎊');
                }, 500);
            }
        });
    }

    startRouletteAnimation(targetNumber, callback) {
        const display = document.getElementById('currentNumber');
        const duration = 3000;
        const startTime = Date.now();
        let speed = 50;
        
        display.classList.add('spinning');
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 0.7) {
                speed = 50;
            } else if (progress < 0.9) {
                speed = 100 + (progress - 0.7) * 500;
            } else {
                speed = 200 + (progress - 0.9) * 2000;
            }
            
            if (elapsed < duration) {
                let randomNumber;
                do {
                    randomNumber = Math.floor(Math.random() * this.maxNumber) + 1;
                } while (this.drawnNumbers.has(randomNumber));
                
                display.textContent = randomNumber;
                display.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
                
                const frequency = 400 + Math.random() * 800;
                this.soundManager.playTickSound(frequency);
                
                setTimeout(() => animate(), speed);
            } else {
                display.classList.remove('spinning');
                display.textContent = targetNumber;
                display.style.color = '#4CAF50';
                display.classList.add('final-number');
                
                setTimeout(() => {
                    display.classList.remove('final-number');
                    if (callback) callback();
                }, 500);
            }
        };
        
        animate();
    }

    celebrateNumber(number) {
        const cell = document.querySelector(`[data-number="${number}"]`);
        if (cell) {
            cell.classList.add('celebrating');
            setTimeout(() => {
                cell.classList.remove('celebrating');
            }, 1000);
        }
        
        this.createConfetti();
    }

    createConfetti() {
        const container = document.querySelector('.container');
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 1 + 1) + 's';
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 2000);
        }
    }

    updateDisplay() {
        const display = document.getElementById('currentNumber');
        display.textContent = this.currentNumber || '-';
        
        display.style.animation = 'none';
        setTimeout(() => {
            display.style.animation = 'pulse 0.5s ease';
        }, 10);
    }

    markNumber(number) {
        const cell = document.querySelector(`[data-number="${number}"]`);
        if (cell) {
            cell.classList.add('drawn');
        }
    }

    updateDrawnNumbersList() {
        const container = document.getElementById('drawnNumbers');
        container.innerHTML = '';
        
        const sortedNumbers = Array.from(this.drawnNumbers).sort((a, b) => a - b);
        sortedNumbers.forEach(num => {
            const span = document.createElement('span');
            span.className = 'drawn-number';
            span.textContent = num;
            container.appendChild(span);
        });
    }

    resetGame() {
        if (this.drawnNumbers.size > 0 && !confirm('ゲームをリセットしますか？')) {
            return;
        }
        
        this.drawnNumbers.clear();
        this.currentNumber = null;
        
        document.getElementById('currentNumber').textContent = '-';
        document.getElementById('drawnNumbers').innerHTML = '';
        
        document.querySelectorAll('.bingo-cell').forEach(cell => {
            cell.classList.remove('drawn');
        });
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

class PrizeManager {
    constructor() {
        this.prizes = [];
        this.loadPrizes();
        this.initEventListeners();
        this.render();
    }

    loadPrizes() {
        const savedPrizes = localStorage.getItem('bingoPrizes');
        if (savedPrizes) {
            this.prizes = JSON.parse(savedPrizes);
        } else {
            this.prizes = Array.from({length: 40}, (_, i) => ({
                id: i + 1,
                name: `景品 ${i + 1}`,
                claimed: false
            }));
            this.savePrizes();
        }
    }

    savePrizes() {
        localStorage.setItem('bingoPrizes', JSON.stringify(this.prizes));
    }

    initEventListeners() {
        document.getElementById('addPrize').addEventListener('click', () => this.addPrize());
    }

    addPrize() {
        const newId = Math.max(...this.prizes.map(p => p.id), 0) + 1;
        this.prizes.push({
            id: newId,
            name: `景品 ${newId}`,
            claimed: false
        });
        this.savePrizes();
        this.render();
    }

    toggleClaim(id) {
        const prize = this.prizes.find(p => p.id === id);
        if (prize) {
            prize.claimed = !prize.claimed;
            this.savePrizes();
            this.render();
        }
    }

    editPrize(id) {
        const prize = this.prizes.find(p => p.id === id);
        if (!prize) return;

        const item = document.querySelector(`[data-prize-id="${id}"]`);
        if (item.classList.contains('editing')) {
            const input = item.querySelector('.prize-input');
            prize.name = input.value || prize.name;
            item.classList.remove('editing');
            this.savePrizes();
            this.render();
        } else {
            item.classList.add('editing');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'prize-input';
            input.value = prize.name;
            
            const nameElement = item.querySelector('.prize-name');
            nameElement.parentNode.insertBefore(input, nameElement.nextSibling);
            input.focus();
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.editPrize(id);
                }
            });
            
            input.addEventListener('blur', () => {
                this.editPrize(id);
            });
        }
    }

    deletePrize(id) {
        if (confirm('この景品を削除しますか？')) {
            this.prizes = this.prizes.filter(p => p.id !== id);
            this.savePrizes();
            this.render();
        }
    }

    resetPrizes() {
        if (confirm('すべての景品をリセットしますか？')) {
            this.prizes = this.prizes.map(p => ({...p, claimed: false}));
            this.savePrizes();
            this.render();
        }
    }

    render() {
        const container = document.getElementById('prizeList');
        container.innerHTML = '';

        const remainingCount = this.prizes.filter(p => !p.claimed).length;
        document.getElementById('prizeCount').textContent = remainingCount;

        this.prizes.forEach(prize => {
            const item = document.createElement('div');
            item.className = `prize-item ${prize.claimed ? 'claimed' : ''}`;
            item.dataset.prizeId = prize.id;
            
            item.innerHTML = `
                <div class="prize-number">${prize.id}</div>
                <div class="prize-name">${prize.name}</div>
                <div class="prize-actions">
                    <button class="prize-btn" onclick="prizeManager.editPrize(${prize.id})" title="編集">✏️</button>
                    <button class="prize-btn" onclick="prizeManager.deletePrize(${prize.id})" title="削除">🗑️</button>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('prize-btn') && 
                    !e.target.classList.contains('prize-input')) {
                    this.toggleClaim(prize.id);
                }
            });
            
            container.appendChild(item);
        });
    }
}

let prizeManager;

document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
    prizeManager = new PrizeManager();
});