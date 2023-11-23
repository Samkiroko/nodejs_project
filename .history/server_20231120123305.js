const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static('public'));

const itemsRouter = require('./routes/items'); //Make sure the path is correct
app.use('/items', itemsRouter);

// This is inside server.js
app.post('/items', function (req, res) {
  // New Item
  const newItem = req.body;

  // Assign a new id to the item
  const newId = items.length > 0 ? items[items.length - 1]['item-id'] + 1 : 1;
  newItem['item-id'] = newId;

  // Add new item to your items data
  items.push(newItem);

  // Save the new items data to your json file
  fs.writeFileSync('items.json', JSON.stringify(items));

  // Send back the newly added item
  res.send(newItem);
});

app.get('/', (req, res) => {
  res.send('Hello, Moving average price tracker!');
});

app.listen(port, () => {
  console.log(
    `Moving  average tracker app is listening at http://localhost:${port}`
  );
});
