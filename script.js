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
        // 引いた番号リストの表示を削除
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


window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
});

class FallingLogos {
    constructor() {
        this.container = document.getElementById('fallingLogos');
        this.createLogos();
        setInterval(() => this.createLogo(), 3000);
    }

    createLogos() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createLogo(), i * 500);
        }
    }

    createLogo() {
        const logo = document.createElement('div');

        // ランダムに画像を選択 (company_logo 90%, numa 5%, makabi 5%)
        const random = Math.random();
        let imageClass;
        if (random < 0.9) {
            imageClass = 'falling-logo-company';
        } else if (random < 0.95) {
            imageClass = 'falling-logo-numa';
        } else {
            imageClass = 'falling-logo-makabi';
        }

        logo.className = `falling-logo ${imageClass}`;

        // ランダムなサイズを生成 (50px ~ 250px)
        const size = Math.random() * 200 + 50;
        logo.style.width = size + 'px';
        logo.style.height = size + 'px';

        logo.style.left = Math.random() * 100 + '%';
        logo.style.animationDuration = (Math.random() * 5 + 10) + 's';
        logo.style.animationDelay = Math.random() * 2 + 's';
        logo.style.opacity = Math.random() * 0.3 + 0.1;

        this.container.appendChild(logo);

        setTimeout(() => {
            logo.remove();
        }, 20000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
    new FallingLogos();
});