// utils/average.js
function calculateMovingAverage(entries) {
  return entries.map((entry, index, array) => {
    const windowStart = Math.max(0, index - 6); // 7-day window
    const window = array.slice(windowStart, index + 1);
    const sum = window.reduce((acc, cur) => acc + parseFloat(cur.price), 0);
    return {
      date: entry.date,
      average: sum / window.length,
    };
  });
}

module.exports = calculateMovingAverage;
