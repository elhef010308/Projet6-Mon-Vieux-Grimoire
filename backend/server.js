const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.route');

application.use('/api/books', bookRoutes);
application.use('/api/auth', authRoutes);