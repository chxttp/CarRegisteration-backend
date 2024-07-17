const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = "mongodb+srv://thanakritpitiviroj:<password>@cluster0.ljitxic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Define a schema and model for car data
const carSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  repairItems: [{ type: String }],
});

const Car = mongoose.model('Car', carSchema);

// API endpoints

// Search for cars by registration number
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query;
    const cars = await Car.find({ registrationNumber: new RegExp(query, 'i') });
    res.json(cars.map(car => car.registrationNumber));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Get repair items for a specific car
app.get('/api/car/:car', async (req, res) => {
  try {
    const car = await Car.findOne({ registrationNumber: req.params.car });
    if (car) {
      res.json(car.repairItems);
    } else {
      res.status(404).send('Car not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Add a new car
app.post('/api/car', async (req, res) => {
  try {
    const { registrationNumber, repairItems } = req.body;
    const car = new Car({ registrationNumber, repairItems });
    await car.save();
    res.status(201).send('Car added');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Update repair items for a car
app.put('/api/car/:car', async (req, res) => {
  try {
    const { repairItems } = req.body;
    const car = await Car.findOneAndUpdate(
      { registrationNumber: req.params.car },
      { repairItems },
      { new: true }
    );
    if (car) {
      res.send('Car updated');
    } else {
      res.status(404).send('Car not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a car
app.delete('/api/car/:car', async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ registrationNumber: req.params.car });
    if (car) {
      res.send('Car deleted');
    } else {
      res.status(404).send('Car not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
