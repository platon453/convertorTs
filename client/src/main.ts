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

// --- DOM Elements ---
const fromCurrencySelect = document.getElementById('fromCurrency') as HTMLSelectElement;
const toCurrencySelect = document.getElementById('toCurrency') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const amountLabel = document.getElementById('amountLabel') as HTMLLabelElement;
const amountInput = document.getElementById('amountInput') as HTMLInputElement;
const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement;
const resultDisplay = document.getElementById('resultDisplay')!;
const resultAmount = document.getElementById('resultAmount')!;
const coin = document.getElementById('coin')!;
const rateInfo = document.getElementById('rateInfo')!;
const transactionLog = document.getElementById('transactionLog') as HTMLUListElement;
const historyChart = document.getElementById('historyChart') as HTMLPreElement;


const currencySymbols: { [key: string]: string } = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};

// --- History Chart Types ---
interface HistoryData {
    [date: string]: {
        [currency: string]: number;
    };
}


// --- Functions ---

function addLogEntry(message: string) {
    const li = document.createElement('li');
    li.textContent = message;
    transactionLog.prepend(li);
    if (transactionLog.children.length > 10) {
        transactionLog.lastChild?.remove();
    }
}

const fetchRate = async (from: string, to: string): Promise<number> => {
    try {
        const response = await fetch(`/api/rate/${from}-${to}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: RateResponse = await response.json();
        return data.rate;
    } catch (error) {
        console.error("Failed to fetch rate:", error);
        if (from === 'EUR' && to === 'RUB') return 93;
        if (from === 'USD' && to === 'RUB') return 90;
        return 1;
    }
};

const fetchHistory = async (from: string, to: string): Promise<HistoryData | null> => {
    try {
        const response = await fetch(`/api/history/${from}-${to}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch history:", error);
        historyChart.textContent = 'Error loading history data...';
        return null;
    }
};


function renderAsciiChart(data: HistoryData, toCurrency: string) {
    const rates = Object.entries(data)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([, ratesObj]) => ratesObj[toCurrency]);

    if (!rates || rates.length === 0) {
        historyChart.textContent = 'No historical data available.';
        return;
    }

    const height = 10;
    const width = rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate;

    const chart = Array(height).fill(0).map(() => Array(width).fill(' '));

    rates.forEach((rate, i) => {
        const normalized = range === 0 ? height - 1 : Math.round(((rate - minRate) / range) * (height - 1));
        const y = height - 1 - normalized;
        chart[y][i] = '█';
    });

    const yAxisLabelMax = `${maxRate.toFixed(2)} - `;
    const yAxisLabelMin = `${minRate.toFixed(2)} - `;
    
    let chartString = '';
    chartString += `${yAxisLabelMax.padEnd(10)}${chart[0].join('')}\n`;
    for (let i = 1; i < height - 1; i++) {
        chartString += `${' '.repeat(10)}${chart[i].join('')}\n`;
    }
    chartString += `${yAxisLabelMin.padEnd(10)}${chart[height - 1].join('')}\n`;

    historyChart.textContent = chartString;
}


async function updateHistoryChart() {
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;
    const historyData = await fetchHistory(from, to);
    if (historyData) {
        renderAsciiChart(historyData, to);
    }
}


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

function updateAmountLabel() {
    amountLabel.textContent = `ВВЕДИТЕ СУММУ В ${fromCurrencySelect.value}`;
    updateHistoryChart();
}

function swapCurrencies() {
    const fromValue = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = fromValue;
    updateAmountLabel();
}


async function initiateConversion() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value) || 0;

    resultDisplay.classList.remove('show');
    coin.style.animation = 'none';

    amountInput.style.animation = 'none';
    setTimeout(() => { amountInput.style.animation = 'glitch 0.3s'; }, 10);

    createParticles();

    await new Promise(resolve => setTimeout(resolve, 100));
    coin.style.animation = 'coinSpin 0.5s linear infinite';

    for (let i = 0; i < 10; i++) {
        coin.textContent = i % 2 === 0 ? '💶' : '💸';
        coin.style.color = i % 2 === 0 ? '#00ff41' : '#00ff88';
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const rate = await fetchRate(fromCurrency, toCurrency);
    const result = amount * rate;
    
    resultAmount.textContent = `0 ${currencySymbols[toCurrency] || toCurrency}`;
    resultDisplay.classList.add('show');

    let current = 0;
    const increment = result / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= result) {
            current = result;
            clearInterval(timer);
        }
        resultAmount.textContent = `${Math.floor(current).toLocaleString()} ${currencySymbols[toCurrency] || toCurrency}`;
    }, 20);

    rateInfo.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
    
    setTimeout(() => {
        coin.style.animation = 'none';
        coin.textContent = '💰';
        coin.style.fontSize = '5em';
        coin.style.filter = 'drop-shadow(0 0 40px gold)';

        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        playSoundEffect();
        
        addLogEntry(`Converted ${amount.toLocaleString()} ${fromCurrency} to ${result.toLocaleString(undefined, {maximumFractionDigits: 2})} ${toCurrency} at rate ${rate.toFixed(4)}`);

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
    } catch (e) { console.log("Audio not supported"); }
}

// --- Event Listeners ---
convertBtn.addEventListener('click', initiateConversion);
swapBtn.addEventListener('click', swapCurrencies);
fromCurrencySelect.addEventListener('change', updateAmountLabel);
toCurrencySelect.addEventListener('change', updateAmountLabel);

// --- Initial Load ---
window.onload = function () {
    createParticles();
    updateAmountLabel();
    setTimeout(() => {
        initiateConversion();
    }, 1000);
};

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});