const mongoose = require('mongoose');

async function connectDB(uri) {
    if (!uri) {
        throw new Error("L'URI MongoDB est manquant dans le fichier .env");
    }
    await mongoose.connect(uri, {
        autoIndex: true // cree automatiquement les index (ex : unique)
    });
    console.log('Connexion a MongoDB locale reussie avec succes !');
}

module.exports = connectDB ;
