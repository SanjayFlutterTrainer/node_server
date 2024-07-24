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
  category: String,
  image: String
});

const CategorySchema = new mongoose.Schema({
  name: String,
  id: String
});
const OrderSchema = new mongoose.Schema({
    items: List,
  datatime:String

});

const Item = mongoose.model('Item', ItemSchema);
const Category = mongoose.model('Category', CategorySchema);
const Order = mongoose.model('Order', OrderSchema);

// CRUD operations for Items
// Create Item
app.post('/items', async (req, res) => {
  const newItem = new Item(req.body);
  try {
    const item = await newItem.save();
    res.status(201).send(item);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read Items
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send(items);
  } catch (err) {
    res.status(400).send(err);
  }
});


app.post('/order', async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const order = await newOrder.save();
    res.status(201).send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read Items
app.get('/order', async (req, res) => {
  try {
    const order = await Order.find();
    res.status(200).send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update Item
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

// Delete Item
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

// CRUD operations for Categories
// Create Category
app.post('/category', async (req, res) => {
  const newCategory = new Category(req.body);
  try {
    const category = await newCategory.save();
    res.status(201).send(category);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read Categories
app.get('/category', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).send(categories);
  } catch (err) {
    res.status(400).send(err);
  }
});


app.get('/items/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const items = await Item.find({ category: categoryId });
    res.status(200).send(items);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
