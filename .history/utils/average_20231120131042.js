// utils/average.js
function calculateMovingAverage(entries) {
  return entries.map((entry, index, array) => {
    const windowStart = Math.max(0, index - 6); // 7-day window
    const windowEnd = index + 1;
    const window = array.slice(windowStart, windowEnd);
    const sum = window.reduce((acc, cur) => acc + cur.price, 0);
    return {
      date: entry.date,
      average: sum / window.length,
    };
  });
}

module.exports = calculateMovingAverage;
