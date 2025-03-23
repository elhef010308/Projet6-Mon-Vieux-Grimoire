const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];             // récupérer le token
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);  // décoder le token
        req.auth = { userId: decodedToken.userId };  // ajout de userId dans la requête
        next();
    } catch {
        res.status(401).json({ message: 'Requête non authentifiée' })
    }
};