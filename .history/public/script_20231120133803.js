// Get form elements
const addItemForm = document.getElementById('addItemForm');
const addEntryForm = document.getElementById('addEntryForm');
const editEntryForm = document.getElementById('editEntryForm');
let currentItemId = null;
let ctx = document.getElementById('myChart').getContext('2d');

// Initialize Chart.js chart
let myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Sales Data',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75,192,192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75,192,192)',
      },
      {
        label: '7-Day Moving Average',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
      },
    ],
  },
  options: getChartOptions(),
});

function getChartOptions() {
  return {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      titleFontColor: 'black',
      bodyFontColor: 'black',
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'black',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
    },
    legend: {
      labels: {
        fontColor: 'black',
        boxWidth: 25,
        padding: 20,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    title: {
      display: true,
      text: 'Sales Data and Moving Average',
      fontSize: 18,
    },
  };
}

window.onload = function () {
  fetchItemsAndDisplay();
};

function fetchItemsAndDisplay() {
  fetch('/items')
    .then((response) => response.json())
    .then((data) => {
      displayItems(data);
      if (data.length > 0) {
        currentItemId = data[0]['item-id'];
        loadChartData(currentItemId);
      }
    })
    .catch((error) => console.error('Error fetching items:', error));
}

function loadChartData(itemId) {
  fetch(`/items/${itemId}`)
    .then((response) => response.json())
    .then((data) => updateChartData(data))
    .catch((error) => console.error('Error loading chart data:', error));
}

function updateChartData(data) {
  myChart.data.labels = data.entries.map((entry) =>
    new Date(entry.date).toLocaleDateString()
  );
  myChart.data.datasets[0].data = data.entries.map((entry) => entry.price);
  myChart.data.datasets[1].data = data.movingAverage.map(
    (entry) => entry.average
  );
  myChart.update();
}

function displayItems(items) {
  let container = document.getElementById('itemContainer');
  container.innerHTML = '';
  items.forEach((item) => createItemCard(item, container));
}

function createItemCard(item, container) {
  let card = document.createElement('div');
  card.className = 'card';
  card.style.backgroundColor =
    currentItemId === item['item-id'] ? '#f8f9fa' : '';

  let cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  let cardTitle = document.createElement('h5');
  cardTitle.className = 'card-title';
  cardTitle.textContent = item['item-name'];

  let cardText = document.createElement('p');
  cardText.className = 'card-text';
  cardText.textContent = item['item-description'];

  let viewButton = createButton('View Entries', 'btn btn-primary', () => {
    currentItemId = item['item-id'];
    loadChartData(item['item-id']);
    displayItems(items);
  });

  let deleteButton = createButton('Delete Item', 'btn btn-danger', () => {
    deleteItem(item['item-id']);
  });

  cardBody.append(cardTitle, cardText, viewButton, deleteButton);
  card.appendChild(cardBody);
  container.appendChild(card);
}

function createButton(text, className, onClick) {
  let button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.onclick = onClick;
  return button;
}

function deleteItem(itemId) {
  fetch(`/items/${itemId}`, { method: 'DELETE' })
    .then(() => fetchItemsAndDisplay())
    .catch((error) => console.error('Error deleting item:', error));
}

addItemForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(addItemForm);
  const item = {
    'item-id': Date.now(), // Using timestamp for unique ID
    'item-name': formData.get('itemName'),
    'item-color': formData.get('itemColor'),
    'item-description': formData.get('itemDescription'),
    entries: [],
  };
  addNewItem(item);
});

function addNewItem(item) {
  fetch('/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
    .then(() => {
      closeModal('#addItemModal');
      fetchItemsAndDisplay();
    })
    .catch((error) => console.error('Error adding item:', error));
}

addEntryForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(addEntryForm);
  const entry = {
    price: Number(formData.get('entryPrice')),
    date: new Date(formData.get('entryDate')).getTime(),
  };
  addNewEntryToItem(currentItemId, entry);
});

function addNewEntryToItem(itemId, entry) {
  fetch(`/items/${itemId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
    .then(() => {
      closeModal('#addEntryModal');
      loadChartData(currentItemId);
    })
    .catch((error) => console.error('Error adding entry:', error));
}

function closeModal(modalSelector) {
  $(modalSelector).modal('hide');
}

editEntryForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(editEntryForm);
  const updatedEntry = {
    price: Number(formData.get('editEntryPrice')),
    date: new Date(formData.get('editEntryDate')).getTime(),
  };
  updateEntry(currentItemId, updatedEntry);
});

function updateEntry(itemId, updatedEntry) {
  fetch(`/items/${itemId}/entries/${updatedEntry.date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedEntry),
  })
    .then(() => {
      closeModal('#editEntryModal');
      loadChartData(itemId);
    })
    .catch((error) => console.error('Error updating entry:', error));
}
