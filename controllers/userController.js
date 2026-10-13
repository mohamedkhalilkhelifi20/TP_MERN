const User = require('../models/userModel');

// 1. Récupérer tous les users
const getUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    } catch (err){
        res.status(500).json ({ message : err.message }) ;
    }
};


// 2. Récupérer un article par id
const getUserById = async (req, res) => {

    try{
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: `Utilisateur introuvable` });
        }
        res.status(200).json(user);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }
        res.status(500).json({ message: err.message });
    }

};

// 3. Créer un nouvel User (POST /api/users)
const createUser =async (req, res) => {
    try{
        const { name,age, email, role } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Le nom et l'email sont requis" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: 'Cet email est deja utilise' });
        }

        const user = await User.create({ name, email, age, role });
        res.status(201).json(user);

    } catch ( err) {
        res. status (500) . json ({ message : err. message }) ;
    }
};


// 4. Supprimer USER
const deleteUser = async(req, res) => {

    try{
        const userExiste = User.findById(req.params.id);
        if (!userExiste) {
            return res.status(404).json({ message: 'Utilisateur non trouve'  });
        }

        // Integrite referentielle : a-t-il des articles ?
        const hasArticle = await Article.findOne({author : req.params.id})
        if (hasArticle) {
            return res.status(400).json({
                message: 'Impossible de supprimer un utilisateur ayant des articles publies'
            });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Utilisateur supprime avec succes', id: req.params.id });

    }catch ( err) {
        res. status (500) . json ({ message : err. message }) ;
    }
}

module.exports = { getUsers, getUserById, createUser,deleteUser };

