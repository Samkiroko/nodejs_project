# Sales & Moving Average Tracker Node.js Project

This project is a Node.js application that includes functionality for calculating a moving average from a series of data entries.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before running this project, make sure you have Node.js installed on your system. If not, you can download and install it from [Node.js official website](https://nodejs.org/).

### Installing

Follow these steps to get a development environment running:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Samkiroko/nodejs_project.git
   ```

2. **Navigate to the project directory:**

   ```sh
   cd moving_average
   ```

3. **Install dependencies:**

   ```sh
   npm install
   ```

4. **Start the server:**

   ```sh
   node server.js
   ```

5. **View in browser:**

   The application will be running at [http://localhost:3000](http://localhost:3000).

## Moving Average Calculation

The project includes a function `calculateMovingAverage` that computes a 7-day moving average for a series of data entries. The function iterates over the entries and calculates the average based on the entry itself and the previous 6 entries, if available. Here's how it works:

```javascript
function calculateMovingAverage(entries) {
  return entries.map((entry, index, array) => {
    const windowStart = Math.max(0, index - 6); // 7-day window, including current day
    const window = array.slice(windowStart, index + 1);
    const sum = window.reduce((acc, cur) => acc + parseFloat(cur.price), 0);
    return {
      date: entry.date,
      average: sum / window.length,
    };
  });
}

module.exports = calculateMovingAverage;
```

For each entry, the function creates a window of 7 days (including the current day) and calculates the average of the `price` values within this window. If there are fewer than 6 previous entries, the function uses whatever data is available.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/Samkiroko/nodejs_project/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/Samkiroko/nodejs_project/LICENSE.md) file for details.
