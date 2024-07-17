const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string
const mongoURI = 'mongodb+srv://thanakritpitiviroj:Fc5PVmKRdPrzTG97@cluster0.ljitxic.mongodb.net/carDatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Car schema and model
const carSchema = new mongoose.Schema({
  registrationNumber: String,
  repairItems: [String]
});

const Car = mongoose.model('Car', carSchema);

// Routes
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  try {
    const cars = await Car.find({ registrationNumber: { $regex: query, $options: 'i' } });
    res.json(cars.map(car => car.registrationNumber));
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/car/:car', async (req, res) => {
  const car = req.params.car;
  try {
    const carDetails = await Car.findOne({ registrationNumber: car });
    if (carDetails) {
      res.json(carDetails.repairItems);
    } else {
      res.status(404).send('Car not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/car', async (req, res) => {
  const { registrationNumber, repairItems } = req.body;
  const newCar = new Car({ registrationNumber, repairItems });
  try {
    await newCar.save();
    res.status(201).send('Car added');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put('/api/car/:car', async (req, res) => {
  const car = req.params.car;
  const { repairItems } = req.body;
  try {
    const updatedCar = await Car.findOneAndUpdate({ registrationNumber: car }, { repairItems }, { new: true });
    if (updatedCar) {
      res.json(updatedCar);
    } else {
      res.status(404).send('Car not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/api/car/:car', async (req, res) => {
  const car = req.params.car;
  try {
    const deletedCar = await Car.findOneAndDelete({ registrationNumber: car });
    if (deletedCar) {
      res.send('Car deleted');
    } else {
      res.status(404).send('Car not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
