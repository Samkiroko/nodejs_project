const express = require('express');
const fs = require('fs');
let router = express.Router();
const calculateMovingAverage = require('../utils/average');

// Get all items
router.get('/', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
      return;
    }
    let items = JSON.parse(data);
    res.send(items);
  });
});

//Add a new item
router.post('/', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let newItem = req.body;
    items.push(newItem);
    fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
      if (err) throw err;
      res.status(201).send('New item added');
    });
  });
});
// Get a specific item with moving average
router.get('/:id', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data');
      return;
    }
    let items = JSON.parse(data);
    let item = items.find((i) => i['item-id'] == req.params.id);

    if (item && item.entries) {
      // Calculate the moving average
      item.movingAverage = calculateMovingAverage(item.entries);
    }

    if (item) {
      res.send(item);
    } else {
      res.status(404).send('Item not found');
    }
  });
});

//Update a specific item
router.put('/:id', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let id = req.params.id;
    let updatedItem = req.body;
    let index = items.findIndex((i) => i['item-id'] == id);
    if (index != -1) {
      items[index] = updatedItem;
      fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
        if (err) throw err;
        res.send(`Item with id ${id} updated`);
      });
    } else {
      res.status(404).send('Item not found');
    }
  });
});

//Delete a specific item
router.delete('/:id', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let id = req.params.id;
    let index = items.findIndex((i) => i['item-id'] == id);
    if (index != -1) {
      items.splice(index, 1);
      fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
        if (err) throw err;
        res.send(`Item with id ${id} deleted`);
      });
    } else {
      res.status(404).send('Item not found');
    }
  });
});

// Add a new entry to a specific item
router.post('/:id/entries', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let id = req.params.id;
    let newEntry = req.body;
    // Convert the newEntry date to a timestamp
    newEntry.date = new Date(newEntry.date).getTime();
    let index = items.findIndex((i) => i['item-id'] == id);
    if (index != -1) {
      items[index].entries.push(newEntry);
      fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
        if (err) throw err;
        res.send(`New entry added to item with id ${id}`);
      });
    } else {
      res.status(404).send('Item not found');
    }
  });
});

router.delete('/:id/entries/:date', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let id = req.params.id;
    let date = req.params.date;
    let index = items.findIndex((i) => i['item-id'] == id);
    if (index != -1) {
      let entryIndex = items[index].entries.findIndex(
        (entry) => new Date(entry.date).getTime() === parseInt(date)
      );
      if (entryIndex != -1) {
        items[index].entries.splice(entryIndex, 1);
        fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
          if (err) throw err;
          res.send(`Entry with date ${date} deleted`);
        });
      } else {
        res.status(404).send('Entry not found');
      }
    } else {
      res.status(404).send('Item not found');
    }
  });
});

//Update a specific entry of a specific item
// Update an entry of a specific item
router.put('/:id/entries/:date', function (req, res) {
  fs.readFile('./items.json', (err, data) => {
    if (err) throw err;
    let items = JSON.parse(data);
    let itemId = req.params.id;
    let date = req.params.date;
    let itemIndex = items.findIndex((item) => item['item-id'] == itemId);
    if (itemIndex != -1) {
      let entryIndex = items[itemIndex].entries.findIndex(
        (entry) =>
          new Date(entry.date).toISOString().split('T')[0] ===
          new Date(parseInt(date)).toISOString().split('T')[0]
      );
      if (entryIndex != -1) {
        let updatedEntry = req.body;
        updatedEntry.date = new Date(updatedEntry.date).getTime(); // Convert date to timestamp
        items[itemIndex].entries[entryIndex] = updatedEntry;
        fs.writeFile('./items.json', JSON.stringify(items, null, 2), (err) => {
          if (err) throw err;
          res.send(`Entry with date ${date} updated`);
        });
      } else {
        res.status(404).send('Entry not found');
      }
    } else {
      res.status(404).send('Item not found');
    }
  });
});

module.exports = router;
