const express = require('express');
const multer = require('../middleware/multer-config');
const router = express.Router();
const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/book.controller');

// D'abord les routes spécifiques
router.get('/bestrating', stuffCtrl.bestThreeBook);

// Puis les routes plus générales
router.get('/', stuffCtrl.getAllBook);
router.get('/:id', stuffCtrl.getOneBook);

// Les POST
router.post('/', auth, multer, stuffCtrl.createBook);
router.post('/:id/rating', auth, stuffCtrl.noteBook);

// Le PUT
router.put('/:id', auth, multer, stuffCtrl.modifyBook);

// Le DELETE
router.delete('/:id', auth, stuffCtrl.deleteBook);

module.exports = router;
