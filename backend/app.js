const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const bookRoute = require('./routes/book.route');
const authRoute = require('./routes/auth.route');

const app = express();

// Connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://Elhef03:<XwsPOrTykUGVz>@cluster0.p4na7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/api/books', bookRoute);
app.use('/api/auth', authRoute);

// Exportation de app.js
module.exports = app;