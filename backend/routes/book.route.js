const express = require('express');
const multer = require('../middleware/multer-config');
const router = express.Router();
const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/book.controller');

router.get('/', stuffCtrl.getAllBook);
router.get('/:id', stuffCtrl.getOneBook);
router.get('/bestrating', stuffCtrl.bestThreeBook);

router.post('/', auth, multer, stuffCtrl.createBook);
router.post('/:id/rating', auth, stuffCtrl.noteBook);

router.put('/:id', auth, multer, stuffCtrl.modifyBook);

router.delete('/:id', auth, stuffCtrl.deleteBook);

module.exports = router;