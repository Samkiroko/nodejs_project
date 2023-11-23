// utils/average.js
// function calculateMovingAverage(entries) {
//   return entries.map((entry, index, array) => {
//     const windowStart = Math.max(0, index - 6); // 7-day window
//     const window = array.slice(windowStart, index + 1);
//     const sum = window.reduce((acc, cur) => acc + parseFloat(cur.price), 0);
//     return {
//       date: entry.date,
//       average: sum / window.length,
//     };
//   });
// }

// module.exports = calculateMovingAverage;

function calculateMovingAverage(entries) {
  return entries.map((entry, index, array) => {
    // Calculate the start index of the 7-day window
    const windowStart = Math.max(0, index - 6); // 7-day window, including current day
    const window = array.slice(windowStart, index + 1);

    // Sum the prices in the window
    const sum = window.reduce((acc, cur) => acc + parseFloat(cur.price), 0);

    // Calculate the average and return the result with the date
    return {
      date: entry.date,
      average: sum / window.length,
    };
  });
}

module.exports = calculateMovingAverage;
