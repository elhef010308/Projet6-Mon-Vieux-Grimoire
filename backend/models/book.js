const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    ratings: {},
    averageRating: {},
});

module.export = mongoose.model('Book', bookSchema);