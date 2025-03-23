const multer = require('multer');

/* Définir les formats d'image acceptés */
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};

const storare = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')  // où stocker les images
    },

    fileames: (req, file, callback) => {
        const name = file.original.split(' ').joint('_').split('.')[0];
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');

