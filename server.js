const express = require('express');   // 1. charger la bibliothèque Express
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes')

const app = express();                // 2. créer l'application : c'est notre serveur
const PORT = 3000;

app.use(express.json());   // lit le corps JSON et le range dans req.body


// Montage du routeur sous le préfixe '/api/articles'
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

// Route d'accueil pour tester le statut général du serveur
app.get('/', (req, res) => {
    res.json({ message: "API du Blog- Serveur Modulaire Opérationnel (SoC)" });
});


// 4. démarrer le serveur : il attend les requêtes sur le port 3000
app.listen(PORT, () => {
    console.log(`Serveur disponible sur http://localhost:${PORT}`);
});

