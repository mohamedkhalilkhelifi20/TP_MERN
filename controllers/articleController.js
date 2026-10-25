const Article = require('../models/articleModel');
const User = require('../models/userModel');

// 1. Récupérer tous les articles (avec filtre optionnel ?author=...)
const getAllArticles = async(req, res) => {
    try {
        const articles = await Article.find().populate('author', 'name email');
        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json ({ message : err.message }) ;
    }

};

// 2. Récupérer un article par id
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author', 'name email');
        if (!article) {
            return res.status(404).json({ message: 'Article non trouve' });
        }
        res.status(200).json(article);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }
        res.status(500).json({ message: err.message });
    }
};


// 3. Créer un nouvel article
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Titre et contenu obligatoires' });
        }

        // L'auteur est extrait du token verifie : usurpation impossible !
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        const populated = await newArticle.populate('author', 'name email role');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Mettre à jour un article existant (PUT /api/articles/:id)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article non trouve' });
        }

        // Verification des droits de propriete
        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'etes pas l'auteur de cet article"
            });
        }

        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;

        const updated = await article.save();
        const populated = await updated.populate('author', 'name email role');
        res.status(200).json(populated);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Identifiant invalide' });
        }
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/articles/:id (Suppression protegee : auteur ou admin)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article non trouve' });
        }

        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: "Action interdite : vous n'etes pas l'auteur de cet article"
            });
        }

        await Article.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Article supprime avec succes', id: req.params.id });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Identifiant invalide' });
        }
        res.status(500).json({ message: err.message });
    }
};


// GET /api/articles/my-articles (Exercice 2 : articles de l'utilisateur connecte)
const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id });
        res.status(200).json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Exportation CommonJS : on rend ces fonctions publiques
module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, getMyArticles };
