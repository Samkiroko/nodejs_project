const calculateMovingAverage = require('./utils/average'); 

describe('calculateMovingAverage', () => {
  test('correctly calculates the moving average for a series of entries', () => {
    const entries = [
      { date: '2023-01-01', price: '100' },
      { date: '2023-01-02', price: '200' },
      { date: '2023-01-03', price: '300' },
      { date: '2023-01-04', price: '400' },
      { date: '2023-01-05', price: '500' },
      { date: '2023-01-06', price: '600' },
      { date: '2023-01-07', price: '700' },
    ];

    const result = calculateMovingAverage(entries);
    expect(result[6].average).toBeCloseTo(400); // The average of the first 7 entries
  });

  test('handles an array with less than 7 entries', () => {
    const entries = [
      { date: '2023-01-01', price: '100' },
      { date: '2023-01-02', price: '200' },
    ];

    const result = calculateMovingAverage(entries);
    expect(result[1].average).toBeCloseTo(150); // The average of the first 2 entries
  });

  test('handles empty array', () => {
    const entries = [];
    const result = calculateMovingAverage(entries);
    expect(result).toEqual([]);
  });
});
