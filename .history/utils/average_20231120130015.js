// A function to calculate the 7-day moving average
function calculateMovingAverage(data) {
  const movingAverages = data.map((entry, index, array) => {
    const window = array.slice(Math.max(0, index - 6), index + 1);
    const sum = window.reduce((acc, cur) => acc + cur.price, 0);
    return {
      date: entry.date,
      average: sum / window.length,
    };
  });
  return movingAverages;
}
