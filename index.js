const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://sanjayksanthosh55:nxiW0AEFy8XhbSOj@cluster0.yrimhnb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Define schemas and models
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
  items: Array,
  datetime: String,
  total: Number
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String }
});

const Item = mongoose.model('Item', ItemSchema);
const Category = mongoose.model('Category', CategorySchema);
const Order = mongoose.model('Order', OrderSchema);
const User = mongoose.model('User', UserSchema);

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

// Read Orders
app.get('/order', async (req, res) => {
  try {
    const order = await Order.find();
    res.status(200).send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/items/search', async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).send({ error: 'Name query parameter is required' });
  }

  try {
    const items = await Item.find({ name: { $regex: new RegExp(name, 'i') } });
    res.status(200).send(items);
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

// User registration
app.post('/register', upload.single('image'), async (req, res) => {
  const { username, password, name, phone, email } = req.body;
  if (!username || !password || !name || !phone || !email) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      phone,
      email,
      image: req.file ? req.file.path : ''
    });
    const user = await newUser.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).send({ token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    res.status(400).send({ error: 'Token is not valid' });
  }
};
// Get user information by token
app.get('/user/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get user information by ID
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update User
app.put('/user/:id', upload.single('image'), async (req, res) => {
  const { username, password, name, phone, email } = req.body;

  // Ensure the user exists
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Update user details
    user.username = username || user.username;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    if (req.file) {
      user.image = req.file.path;
    }

    const updatedUser = await user.save();
    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete User
app.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Protect routes (example of protected route)
app.get('/protected', auth, (req, res) => {
  res.status(200).send({ msg: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
