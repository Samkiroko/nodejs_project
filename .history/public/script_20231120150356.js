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
    .then((data) => {
      updateChartData(data); // Updates the chart
      displayEntries(data.entries); // Updates the list of entries
    })

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
  container.innerHTML = ''; // Clear the container

  items.forEach((item) => {
    let card = document.createElement('div');
    card.className = 'card';

    // Check if this is the currently active item
    if (currentItemId === item['item-id']) {
      // Change the background color
      // Change the background color
      card.style.backgroundColor = '#f8f9fa';
      // Add a border radius and border color
      card.style.borderRadius = '15px';
      card.style.borderColor = '#78DFDF';
      card.style.borderWidth = '2px';
      card.style.borderStyle = 'solid';
    }

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    let cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = item['item-name'];

    let cardText = document.createElement('p');
    cardText.className = 'card-text';
    cardText.textContent = item['item-description'];

    let viewButton = document.createElement('button');
    viewButton.className = 'btn btn-primary';
    viewButton.textContent = 'View Entries';

    viewButton.onclick = function () {
      currentItemId = item['item-id'];
      currentName = item['item-name'];
      loadChartData(item['item-id']);
      displayItems(items); // Refresh the items display
    };

    let deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.marginLeft = '10px';
    deleteButton.textContent = 'Delete Item';

    deleteButton.onclick = function () {
      fetch(`/items/${item['item-id']}`, {
        method: 'DELETE',
      }).then((response) => location.reload());
    };

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(viewButton);
    cardBody.appendChild(deleteButton);
    card.appendChild(cardBody);
    container.appendChild(card);
  });
}

function displayEntries(entries) {
  let entriesContainer = document.getElementById('entriesModalBody');
  entriesContainer.innerHTML = ''; // Clear existing entries

  // Sort the entries by date
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  entries.forEach((entry) => {
    let entryDiv = document.createElement('div');
    entryDiv.className = 'entry-div'; // Add a class for styling if needed
    entryDiv.textContent = `Price: ${entry.price}, Date: ${new Date(
      entry.date
    ).toLocaleDateString()}`;

    // Create Edit Button
    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'btn btn-primary btn-sm';
    editButton.onclick = function () {
      // Code to populate and show edit modal
      populateEditForm(entry);
    };

    // Create Delete Button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.onclick = function () {
      // Code to handle delete action
      deleteEntry(entry);
    };

    // Append buttons to entryDiv
    entryDiv.appendChild(editButton);
    entryDiv.appendChild(deleteButton);

    entriesContainer.appendChild(entryDiv);
  });
}

function populateEditForm(entry) {
  // Populate the edit form with entry data
  document.getElementById('editEntryPrice').value = entry.price;
  document.getElementById('editEntryDate').value = new Date(entry.date)
    .toISOString()
    .split('T')[0];
  currentEntryId = entry.date; // Set current entry ID for later use
  $('#editEntryModal').modal('show');
}

function deleteEntry(entry) {
  // Confirm before delete
  if (confirm(`Are you sure you want to delete this entry?`)) {
    // Call the backend to delete the entry
    fetch(`/items/${currentItemId}/entries/${entry.date}`, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        // Refresh the chart and entries list
        loadChartData(currentItemId);
      } else {
        alert('Error deleting entry');
      }
    });
  }
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
