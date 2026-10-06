const { estNonVide, estEmailValide } = require('../utils/validators');

let users = [
    { id: 1, name: 'Mohamed khalil', email: 'medkh@gmail.com', role: 'admin' },
    { id: 2, name: 'Ali', email: 'Ali@gmail.com', role: 'user' }
];
let prochainId = 3;

// 1. Récupérer tous les users
const getAllUsers = (req, res) => {
    const { role } = req.query;
    let resultat = users;
    if (role) {
        resultat = users.filter(a => a.role === role);
    } res.status(200).json({ total: resultat.length, users: resultat });
};


// 2. Récupérer un article par id
const getUserById = (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: `Utilisateur ${id} introuvable` });
    }
    res.status(200).json(user);
};

// 3. Créer un nouvel User
const createUser = (req, res) => {
    const { name, email, role } = req.body;
    if (!estNonVide(name)) {
        return res.status(400).json({ error: 'Le nom est obligatoire et ne doit pas être vide' });
    }
    if (!estEmailValide(email)) {
        return res.status(400).json({ error: "L'email est invalide : il doit contenir '@' et '.'" });
    }
    const nouvelUser = { id: prochainId++, name, email, role: role || 'user' };
    users.push(nouvelUser);
    res.status(201).json({ message: 'Utilisateur créé', user: nouvelUser });
};


// 4. Supprimer USER
const deleteUser = (req, res) => {
    const id = Number(req.params.id);
    const userExiste = users.some(a => a.id === id);
    if (!userExiste) {
        return res.status(404).json({ error: `Impossible de supprimer : user ${id} introuvable` });
    }

    // On filtre pour ne garder que les articles ayant un ID différent
    users = users.filter(a => a.id !== id);
    res.status(200).json({ message: `User ${id} supprimé avec succès` });
}

module.exports = { getAllUsers, getUserById, createUser, deleteUser };

