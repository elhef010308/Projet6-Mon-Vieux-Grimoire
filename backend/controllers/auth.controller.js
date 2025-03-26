const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};

/* LOGIN va permettre de se connecter en utilisant
   un email et un mot de passe qui, s'ils sont corrects,
   vont renvoyer un TOKEN d'authentification */
exports.login = (req, res, next) => {
    /* 
       ETAPE 1 : récupérer l'adresse email envoyée 
       ETAPE 2 : chercher si un utilisateur existe via cet email 
       ETAPE 3 : si l'utilisateur est trouové, récupéré le mot de passe associé
       ETAPE 4 : vérifier si le mot de passe est correct 
        --> SI NON retourner une erreur
        --> SI OUI créer le token jxt 
            - le token jwt doit contenir au minimum l'userId
            - utiliser le secret JWT (process.env.TOKEN_SECRET) pour signer le token
            - définir la durée de validité de ce token
                
       ETAPE 5 : si tout est ok renvoyer le token au client 
    */

    User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ message: 'Identifiants de connection incorrects' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valide => {
                    if(!valide) {
                        return res.status(401).json({ message: 'Identifiants de connection incorrects' });
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET,
                            { expiresIn: '24h' }
                        )
                    })
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


// ROUTE CRÉÉE UNIQUEMENT POUR EFFECTUER LES TESTS POSTMAN 
exports.deleteUser = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }

            bcrypt.compare(password, user.password) 
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Identificants de connexion incorrects' });
                    }

                    User.deleteOne({ _id: user._id })
                        .then(() => res.status(200).json({ message: 'Compte utilisateur supprimé' }))
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}: