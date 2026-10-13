const express = require('express');   // 1. charger la bibliothèque Express
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes')
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv . config () ;
const app = express () ;
const PORT = process . env. PORT || 3000;

app.use(express.json());   // lit le corps JSON et le range dans req.body


// Montage du routeur sous le préfixe '/api/articles'
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

(
    async () => {
        try {
            await connectDB(process.env.MONGODB_URI);
            app.listen(PORT, () => {
                console.log(`Serveur MERN en ecoute sur http://localhost:${PORT}`);
            });
        } catch (err) {
            console.error('Erreur critique de demarrage du serveur :', err.message);
            process.exit(1);
        }
})();


