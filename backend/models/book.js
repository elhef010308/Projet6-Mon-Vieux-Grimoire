const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    price: { type: Number, required: true },
    userId: { type: String, required: true },

    // Les notes utilisateurs
    ratings: [{ userId: String, grade: Number }],

    // Note moyenne du livre initialisée à 0 lorsqu'il n'y en as aucune
    averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model('Book', bookSchema);