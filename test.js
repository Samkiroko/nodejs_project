// Get form elements
const addItemForm = document.getElementById('addItemForm');
const addEntryForm = document.getElementById('addEntryForm');
let currentItemId = null;
let ctx = document.getElementById('myChart').getContext('2d');
const editEntryForm = document.getElementById('editEntryForm');

window.onload = function () {
  fetch('/items')
    .then((response) => response.json())
    .then((data) => {
      displayItems(data);

      // If there are any items, load the chart data for the first one
      if (data.length > 0) {
        currentItemId = data[0]['item-id'];
        loadChartData(currentItemId);
      }
    });
};

let myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // This should be your array of dates
    datasets: [
      {
        // label: item['item-name'],
        label: 'Track Item',
        data: [], // This should be your array of prices
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75,192,192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75,192,192)',
      },
    ],
  },
  options: {
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
      text: 'Track Item',
      fontSize: 18,
    },
  },
});

function loadChartData(itemId) {
  fetch(`/items/${itemId}`)
    .then((response) => response.json())
    .then((data) => {
      // Clear existing data from the chart
      myChart.data.labels = [];
      myChart.data.datasets = [];

      // Assuming your item data has an 'entries' array and a 'movingAverage' array
      const labels = data.entries.map((entry) =>
        new Date(entry.date).toLocaleDateString()
      );
      const salesData = data.entries.map((entry) => entry.price);
      const movingAverageData = data.movingAverage.map(
        (entry) => entry.average
      );

      // Update chart labels (dates)
      myChart.data.labels = labels;

      // Add dataset for sales data
      myChart.data.datasets.push({
        label: 'Sales Data',
        data: salesData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75,192,192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75,192,192)',
      });

      // Add dataset for moving average
      myChart.data.datasets.push({
        label: '7-Day Moving Average',
        data: movingAverageData,
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
      });

      // Update the chart with the new data
      myChart.update();
    })
    .catch((error) => {
      console.error('Error loading chart data:', error);
    });
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

addItemForm.addEventListener('submit', function (e) {
  e.preventDefault();

  console.log('Form Submitted');

  const formData = new FormData(addItemForm);
  const item = {
    'item-id': Math.floor(Math.random() * 1000),
    'item-name': formData.get('itemName'),
    'item-color': formData.get('itemColor'),
    'item-description': formData.get('itemDescription'),
    entries: [],
  };
  // Check if entry data was provided and add it to item entries
  const entryPrice = formData.get('entryPrice');
  const entryDate = formData.get('entryDate');
  if (entryPrice && entryDate) {
    let entry = {
      price: Number(entryPrice),
      date: new Date(entryDate).getTime(),
    };
    item.entries.push(entry);
  }

  fetch(`/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  }).then((response) => {
    $('#addItemModal').modal('hide'); // Close the modal
    location.reload(); // Refresh the page
  });
});

// Handle form submissions for addEntryForm
addEntryForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(addEntryForm);
  const entry = {
    price: formData.get('entryPrice'),
    date: new Date(formData.get('entryDate')).getTime(), // Convert date to timestamp
  };

  fetch(`/items/${currentItemId}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        $('#addEntryModal').modal('hide'); // Close the modal
        loadChartData(currentItemId); // Update chart data and entries view
      }
    })
    .catch((error) => console.error(error));
});

function updateEntry(itemId, entryDate, updatedData) {
  fetch(`/items/${itemId}/entries/${entryDate}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  }).then((response) => {
    if (response.ok) {
      // Update chart data and entries view
      loadChartData(itemId);
    } else {
      console.error(`HTTP error! status: ${response.status}`);
    }
  });
}

function updateChart(entry) {
  myChart.data.labels.push(new Date(entry.date).toLocaleDateString()); // Format date to a simple string
  myChart.data.datasets[0].data.push(entry.price);
  myChart.update();
}

editEntryForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(editEntryForm);
  const updatedEntry = {
    price: formData.get('editEntryPrice'),
    date: formData.get('editEntryDate'),
  };

  updateEntry(currentItemId, currentEntryId, updatedEntry);
  $('#editEntryModal').modal('hide'); // Close the modal
});

function updateEntry(itemId, entryDate, updatedData) {
  fetch(`/items/${itemId}/entries/${entryDate}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  }).then((response) => {
    if (response.ok) {
      // Update chart data and entries view
      loadChartData(itemId);
    } else {
      console.error(`HTTP error! status: ${response.status}`);
    }
  });
}

function deleteEntry(itemId, entryDate) {
  fetch(`/items/${itemId}/entries/${entryDate}`, {
    method: 'DELETE',
  }).then((response) => {
    if (response.ok) {
      // Update chart data and entries view
      loadChartData(itemId);
    } else {
      console.error(`HTTP error! status: ${response.status}`);
    }
  });
}
