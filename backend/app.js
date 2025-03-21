const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.route');

const app = express();

// Connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://Elhef03:<XwsPOrTykUGVz>@cluster0.p4na7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
