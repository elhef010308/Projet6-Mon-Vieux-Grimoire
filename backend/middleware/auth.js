const jwt = require('jsonwebtoken');

// TOKEN STOCKE DANS LE NAVIGATEUR
module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];             // récupérer le token     // ? --> tableau créé ?  // console log de token sans le crochet 1 pour essayer (array apparait ? ) --> crochet 1 = élément 1 du tableau qui commence à 0
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);  // décoder le token et le vérifier
        req.auth = { userId: decodedToken.userId };  // ajout de userId dans la requête
        next();
    } catch {
        res.status(401).json({ message: 'Requête non authentifiée' })
    }
};