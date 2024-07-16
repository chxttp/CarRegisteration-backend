// backend/index.js
const express = require('express');
const mammoth = require('mammoth');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

let carData = {};

// Read data from the Word file and parse it into an object
mammoth.extractRawText({ path: 'repairItems.docx' })
  .then((result) => {
    const text = result.value;
    const lines = text.split('\n');
    lines.forEach((line) => {
      const [car, items] = line.split(':');
      if (car && items) {
        carData[car.trim()] = items.split(',').map(item => item.trim());
      }
    });
  })
  .catch((err) => {
    console.error(err);
  });

app.get('/api/search', (req, res) => {
  const query = req.query.query;
  const matches = Object.keys(carData).filter((car) =>
    car.includes(query)
  );
  res.json(matches);
});

app.get('/api/car/:car', (req, res) => {
  const car = req.params.car;
  res.json(carData[car] || []);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
