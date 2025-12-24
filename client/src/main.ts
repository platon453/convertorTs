// Matrix эффект
const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops: number[] = [];

for (let i = 0; i < columns; i++) drops[i] = 1;

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// Конвертер
interface RateResponse {
    rate: number;
}

const fetchRate = async (): Promise<number> => {
    try {
        const response = await fetch('/api/rate');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: RateResponse = await response.json();
        return data.rate;
    } catch (error) {
        console.error("Failed to fetch rate:", error);
        // Fallback to a static rate if the API fails
        return 93;
    }
};


// Создание частиц
function createParticles() {
    const container = document.getElementById('particles')!;
    container.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.setProperty('--tx', `${Math.random() * 100 - 50}px`);
        particle.style.backgroundColor = `hsl(${Math.random() * 60 + 100}, 100%, 50%)`;
        container.appendChild(particle);
    }
}

// Анимация конвертации
async function initiateConversion() {
    const input = document.getElementById('euroInput') as HTMLInputElement;
    const resultDisplay = document.getElementById('resultDisplay')!;
    const resultAmount = document.getElementById('resultAmount')!;
    const coin = document.getElementById('coin')!;
    const rateInfo = document.getElementById('rateInfo')!;

    const amount = parseFloat(input.value) || 0;

    // Сброс анимации
    resultDisplay.classList.remove('show');
    coin.style.animation = 'none';

    // Эффект хакинга
    input.style.animation = 'none';
    setTimeout(() => {
        input.style.animation = 'glitch 0.3s';
    }, 10);

    // Создаем частицы
    createParticles();

    // Старт анимации
    await new Promise(resolve => setTimeout(resolve, 100));
    coin.style.animation = 'coinSpin 0.5s linear infinite';

    // Симуляция процесса
    for (let i = 0; i < 10; i++) {
        coin.textContent = i % 2 === 0 ? '💶' : '💸';
        coin.style.color = i % 2 === 0 ? '#00ff41' : '#00ff88';
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Получаем курс
    const rate = await fetchRate();
    const result = amount * rate;
    
    // Анимация цифр
    resultAmount.textContent = '0 ₽';
    resultDisplay.classList.add('show');

    let current = 0;
    const increment = result / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= result) {
            current = result;
            clearInterval(timer);
        }
        resultAmount.textContent = `${Math.floor(current).toLocaleString()} ₽`;
    }, 20);

    rateInfo.textContent = `1 EUR = ${rate.toFixed(4)} RUB`;
    
    // Финальный эффект
    setTimeout(() => {
        coin.style.animation = 'none';
        coin.textContent = '💰';
        coin.style.fontSize = '5em';
        coin.style.filter = 'drop-shadow(0 0 40px gold)';

        // Вибрация (если поддерживается)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Звуковой эффект (опционально)
        playSoundEffect();
    }, 1500);
}

function playSoundEffect() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log("Audio not supported");
    }
}

// Event Listeners
document.getElementById('convertBtn')?.addEventListener('click', initiateConversion);


// Автозапуск при загрузке
window.onload = function () {
    createParticles();
    setTimeout(() => {
        document.getElementById('resultDisplay')!.classList.add('show');
        initiateConversion();
    }, 1000);
};

// Адаптация размера canvas
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});