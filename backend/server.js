const http = require('http');
const app = require('./app');

/* Convertir proprement le port d'utilisation (ex: 5000) */
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
};

/* Stocker le port dans l'application Express : Si une variable environnement PORT existe on l'utilise 
   sinon on utilise le port 5000 par défaut */
const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);


// Gestion des erreurs de démarrage du serveur
const errorHandler = error => {
    if (error.syscall !== 'listen') throw error;
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges.`);
            process.exit(1);
        case 'EADDRINUSE':
            console.error(`${bind} is already in use.`);
            process.exit(1);
        default:
            throw error;
    }
};

// Créer un vrai serveur HTTP qui va utiliser la congig Express (importée depuis ./app)
const server = http.createServer(app);

// Si une erreur survient pendant le démarrage du serveur on appelle "errorHandler"
server.on('error', errorHandler);

// Lorsque le serveur démarre on affiche un message dans la console
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
    console.log(`Listening on ${bind}`);
});

// Démarrage du serveur (écouter le port défini)
server.listen(port);