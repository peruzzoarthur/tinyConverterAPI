const requestURL = 'https://api.exchangerate.host/latest';
const form = document.getElementById('conversionForm');
const resultDiv = document.getElementById('result');
let chartCanvas = document.getElementById('chart');
const symbolList = document.getElementById('symbolList');
let symbols;
const timeFrameButtonsDiv = document.getElementById('timeFrameButtons');
timeFrameButtonsDiv.classList.add('hidden');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior

    const amount = document.getElementById('amount').value;
    const base = document.getElementById('base').value;
    symbols = document.getElementById('symbols').value;
    showSpinner()
    try {
        const response = await fetch('/convert5', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, base, symbols })
        });

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }

        const data = await response.json();
        const data2 = data.data;
        const dates = Object.keys(data2);
        const values = Object.values(data2).map(item => item[symbols]);

        clearGraph();
        generateGraph(dates, values);
        clearSymbolList();

    } catch (error) {
        console.error(error);
    }
    document.getElementById('fiveDaysButton').addEventListener('click', async () => updateGraph(5));
    document.getElementById('fifteenDaysButton').addEventListener('click', async () => updateGraph(15));
    document.getElementById('thirtyDaysButton').addEventListener('click', async () => updateGraph(30));
    document.getElementById('threeMonthsButton').addEventListener('click', async () => updateGraph(90));
    document.getElementById('oneYearButton').addEventListener('click', async () => updateGraph(365));
    hideSpinner()
});

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    showSpinner()
    const amount = document.getElementById('amount').value;
    const base = document.getElementById('base').value;
    symbols = document.getElementById('symbols').value;

    try {
        const response = await fetch('/convert5/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, base, symbols })
        });

        const data = await response.json();

        if (response.ok) {
            const resultText = `Converted ${data.fromAmount} ${data.fromCurrency} to ${data.toAmount} ${data.toCurrency}. Exchange rate: ${data.rate}`;
            resultDiv.textContent = resultText;
        } else {
            resultDiv.textContent = 'An error occurred during conversion.';
        }
    } catch (error) {
        resultDiv.textContent = 'An error occurred during the request.';
    }
    hideSpinner();
    timeFrameButtonsDiv.classList.remove('hidden')
    
document.getElementById('fiveDaysButton').addEventListener('click', async () => updateGraph(5));
document.getElementById('fifteenDaysButton').addEventListener('click', async () => updateGraph(15));
document.getElementById('thirtyDaysButton').addEventListener('click', async () => updateGraph(30));
document.getElementById('threeMonthsButton').addEventListener('click', async () => updateGraph(90));
document.getElementById('oneYearButton').addEventListener('click', async () => updateGraph(365));

});


function updateGraph(timeFrame) {
    // Show spinner while updating the graph
    showSpinner();
  
    const amount = document.getElementById('amount').value;
    const base = document.getElementById('base').value;
    const symbols = document.getElementById('symbols').value;
  
    fetch('/convert5/graphs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, base, symbols, timeFrame }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`An error has occurred: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const data2 = data.data;
        const dates = Object.keys(data2);
        const values = Object.values(data2).map((item) => item[symbols]);
  
        clearGraph();
        generateGraph(dates, values);
  
        // Hide spinner after updating the graph
        hideSpinner();
      })
      .catch((error) => {
        console.error(error);
      
        hideSpinner();
        resultDiv.textContent = 'An error occurred during graph update.';
      });
  }
  

    async function populateSymbolList() {
        try {
            const response = await fetch(requestURL);
            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }
            const data = await response.json();
            const symbols = Object.keys(data.rates);
            symbols.forEach((symbol) => {
                const option = document.createElement('option');
                option.value = symbol;
                symbolList.appendChild(option);
            });
        } catch (error) {
            console.error(error);
        }
    }

    function generateGraph(dates, values) {
        chartCanvas = document.getElementById('chart');
        new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `Exchange Rate`,
                    data: values,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }
    
    function clearGraph() {
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = '<canvas id="chart" width="200" height="200"></canvas>';
    }

    function clearSymbolList() {
        symbolList.innerHTML = '';
    }

    function showSpinner() {
        const button = document.querySelector('button');
        button.disabled = true;
        button.innerHTML='Converting... <span class="spinner">💸</span>'
    }

    function hideSpinner() {
        const button = document.querySelector('button');
        button.disabled = false;
        button.innerHTML='Convert';
    }

    populateSymbolList();
    
