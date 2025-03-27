const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/auth.controller');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// ROUTE CRÉÉE UNIQUEMENT POUR EFFECTUER LES TESTS POSTMAN 
router.delete('/delete', userCtrl.deleteUser);

module.exports = router;