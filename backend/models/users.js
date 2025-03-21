const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Appliquer le validator pour s'assurer que l'adresse email n'existe pas déjà 
userSchema.plugin(uniqueValidator);

// Exporter le modèle
module.export = mongoose.model('User', userSchema);

