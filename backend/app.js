require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const bookRoute = require('./routes/book.route');
const authRoute = require('./routes/auth.route');

const app = express();

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => {
    console.log('Connexion à MongoDB échouée !');
    console.error(err);
  });

app.use(cors());
app.use(express.json());

// Pouvoir accéder aux fichiers images dans le navigateur
app.use('/images', express.static(path.join(__dirname, 'images')));

// Les routes 
app.use('/api/books', bookRoute);
app.use('/api/auth', authRoute);

// Exportation de app.js
module.exports = app;