// app.js

// Import necessary tools (libraries)
require('dotenv').config();
const express = require('express'); 
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');


const mongoDB = 'mongodb+srv://ALTSCHOOLAFRICAPROJECT:Herroyalhighness1@cluster0.ys1glww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(mongoDB)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const User = require('./User.js');

const app = express();


app.use(express.json());

const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from your first API!'); 
});


app.get('/blogs', (req, res) => {
  res.send('This will be a list of all blog posts!'); 
});


app.post('/signup', async (req, res) => {
  try {
   
    const { first_name, last_name, email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        
        return res.status(400).send('Email already registered.');
    }


    const nonHashed = 10;
    const hashedPassword = await bcrypt.hash(password, nonHashed);

    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).send('User registered successfully!'); 

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Something went wrong during registration.');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid Credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send('Invalid Credentials');
    }

const payload = {
  userId: user._id,
  email: user.email
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

res.status(200).json({
  message: 'Logged in successfully!',
  token: token, 
  userId: user._id 
});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Something went wrong during login.');
  }
});

app.listen(port, () => {
  console.log(`Our API server is listening at http://localhost:${port}`);
});
