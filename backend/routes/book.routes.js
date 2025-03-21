const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/book.controller');

router.get('/api/books', stuffCtrl.getAllBook);
router.get('/api/books/:id', stuffCtrl.getOneBook);
router.get('/api/books/bestrating', stuffCtrl.bestThreeBook);

router.post('/api/books', auth, stuffCtrl.createBook);
router.post('/api/books/:id/rating', auth, stuffCtrl.noteBook);

router.put('/api/books/:id', auth, stuffCtrl.modifyBook);

router.delete('/api/books/:id', auth, stuffCtrl.deleteBook);