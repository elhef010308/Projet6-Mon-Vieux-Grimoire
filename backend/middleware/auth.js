const jwt = require('jsonwebtoken');

/* 
   Middleware qui vérifie que le token JWT est bien présente et valide. 
   Si ce n'est pas le cas on retourne une erreur, sinon on autorise l'accès
   aux routes qui le nécessitent avec "next( )" 
*/

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];             
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); 
        req.auth = { userId: decodedToken.userId };  
        next();
    } catch {
        res.status(401).json({ message: 'Requête non authentifiée' })
    }
};