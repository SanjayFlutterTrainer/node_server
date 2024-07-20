const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://sanjayksanthosh55:nxiW0AEFy8XhbSOj@cluster0.yrimhnb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Define a simple schema and model
const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category:String,
  image:String
});
const CategorySchema = new mongoose.Schema({
  name: String,
id:String
});

const Item = mongoose.model('Item', ItemSchema);
const Category = mongoose.model('Category', CategorySchema);
// CRUD operations
// Create
app.post('/items', async (req, res) => {
  const newItem = new Item(req.body);
  try {
    const item = await newItem.save();
    res.status(201).send(item);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send(items);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read category
app.get('/category', async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).send(category);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Update
app.put('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).send();
    }
    res.status(200).send(item);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete
app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send();
    }
    res.status(200).send(item);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
