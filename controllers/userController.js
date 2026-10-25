const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utilitaire de generation de Token JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// POST /api/users/register (Inscription)
const registerUser = async (req, res) => {
    try {
        //on ne lit PAS le role dans le body
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
        }

        // Le schema controle la longueur du hash (60 car.), donc on controle ici le vrai mot de passe
        if (password.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caracteres' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'Cet email est deja utilise' });
        }

        // Hachage securise avec sel (Salt factor = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            role: 'user' //role toujours 'user' a l'inscription
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users/login (Connexion)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/profile (Profil protege)
const getUserProfile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users (Admin uniquement)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// PUT /api/users/update-password
const updatePassword = async(req,res) =>{
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le nouveau mot de passe doit comporter au moins 6 caracteres' });
        }

        // req.user n'a pas le mot de passe (select('-password')), on recharge l'utilisateur complet
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
        }

        // Nouveau sel + nouveau hachage
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// PUT /api/users/:id/role (Exercice 2 : admin uniquement)
const updateUserRole =async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouve' });
        }
        user.role = 'admin';
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Identifiant invalide' });
        }
        res.status(500).json({ message: err.message });
    }
}

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

module.exports = { getUsers, getUserById, createUser,deleteUser, registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword,
    updateUserRole
};

