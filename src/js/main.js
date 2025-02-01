let currencies = [];
let fromCurrency = null;
let toCurrency = null;
let currentModalType = null; // 'from' or 'to'


// Fetch currencies from API
async function fetchCurrencies() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1&sparkline=false');
        const data = await response.json();
        currencies = data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            price: coin.current_price
        }));
        renderCurrencyList(currencies);

        // Update prices if fromCurrency or toCurrency is selected
        if (fromCurrency || toCurrency) {
            updateSelectedCurrencies(data);
            calculateConvertedAmount();
            updatePriceComparison();
        }
    } catch (error) {
        console.error('Error fetching currencies:', error);
    }
}

// Update selected currencies with new prices
function updateSelectedCurrencies(data) {
    if (fromCurrency) {
        const fromCoin = data.find(coin => coin.id === fromCurrency.id);
        if (fromCoin) {
            fromCurrency.price = fromCoin.current_price;
        }
    }
    if (toCurrency) {
        const toCoin = data.find(coin => coin.id === toCurrency.id);
        if (toCoin) {
            toCurrency.price = toCoin.current_price;
        }
    }
}

// Render currency list in modal
function renderCurrencyList(filteredCurrencies) {
    const currencyList = document.getElementById('currency-list');
    currencyList.innerHTML = filteredCurrencies.map(currency => `
        <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center" onclick="selectCurrency('${currency.id}', '${currency.symbol}', ${currency.price})">
            <img src="${currency.image}" alt="${currency.name}" class="w-6 h-6 mr-2">
            <span>${currency.name} (${currency.symbol})</span>
        </div>
    `).join('');
}

// Open modal for currency selection
function openModal(type) {
    currentModalType = type;
    document.getElementById('currency-modal').classList.remove('hidden');
    document.getElementById('search-currency').value = '';
    renderCurrencyList(currencies);
}

// Close modal
function closeModal() {
    document.getElementById('currency-modal').classList.add('hidden');
}

// Select currency
function selectCurrency(id, symbol, price) {
    if (currentModalType === 'from') {
        fromCurrency = { id, symbol, price };
        document.getElementById('from-currency').innerHTML = `<span>${symbol}</span> <span>▼</span>`;
    } else if (currentModalType === 'to') {
        toCurrency = { id, symbol, price };
        document.getElementById('to-currency').innerHTML = `<span>${symbol}</span> <span>▼</span>`;
    }
    closeModal();
    calculateConvertedAmount();
    updatePriceComparison();
}

// Swap currencies
function swapCurrencies() {
    if (fromCurrency && toCurrency) {
        const temp = fromCurrency;
        fromCurrency = toCurrency;
        toCurrency = temp;

        // Update UI
        document.getElementById('from-currency').innerHTML = `<span>${fromCurrency.symbol}</span> <span>▼</span>`;
        document.getElementById('to-currency').innerHTML = `<span>${toCurrency.symbol}</span> <span>▼</span>`;

        // Recalculate converted amount
        calculateConvertedAmount();
        updatePriceComparison();
    }
}

// Calculate converted amount
function calculateConvertedAmount() {
    const amount = parseFloat(document.getElementById('amount').value);

    if (fromCurrency && toCurrency && !isNaN(amount) && amount > 0) {
        const convertedAmount = (amount * fromCurrency.price) / toCurrency.price;
        document.getElementById('converted-amount').innerText = convertedAmount.toFixed(2);
    } else {
        document.getElementById('converted-amount').innerText = '0';
    }
}

// Update price comparison
function updatePriceComparison() {
    if (fromCurrency && toCurrency) {
        const fromToPrice = (1 * fromCurrency.price) / toCurrency.price;
        const toFromPrice = (1 * toCurrency.price) / fromCurrency.price;

        document.getElementById('from-symbol').innerText = fromCurrency.symbol;
        document.getElementById('to-symbol').innerText = toCurrency.symbol;
        document.getElementById('from-to-price').innerText = fromToPrice.toFixed(6);
        document.getElementById('to-symbol-2').innerText = toCurrency.symbol;
        document.getElementById('from-symbol-2').innerText = fromCurrency.symbol;
        document.getElementById('to-from-price').innerText = toFromPrice.toFixed(6);
    }
}

// Search currencies
document.getElementById('search-currency').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCurrencies = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm) || currency.symbol.toLowerCase().includes(searchTerm)
    );
    renderCurrencyList(filteredCurrencies);
});

// Add event listener to amount input
document.getElementById('amount').addEventListener('input', calculateConvertedAmount);

// Add event listener to swap currencies button
document.getElementById('swap-currencies').addEventListener('click', swapCurrencies);

// Start a timer to update prices every 10 seconds
function startPriceUpdateTimer() {
    setInterval(fetchCurrencies, 10000); // 10000 milliseconds = 10 seconds
}



// Fetch currencies and start timers on page load
fetchCurrencies();
startPriceUpdateTimer();
