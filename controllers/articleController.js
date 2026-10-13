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
        const { title, content, authorId } = req.body;
        if (!title || !content || !authorId) {
            return res.status(400).json({ message: 'title, content et authorId sont obligatoires' });
        }
        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: 'Auteur non trouve (identifiant authorId invalide)' });
        }
        const newArticle = await Article.create({
            title,
            content,
            author: authorId
        });
        const populatedArticle = await newArticle.populate('author', 'name email');
        res.status(201).json(populatedArticle);
    } catch (err) {
        res. status (500) . json ({ message : err. message }) ;
    }
};

// 4. Mettre à jour un article existant (PUT /api/articles/:id)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!article) {
            return res.status(404).json({ message: 'Article introuvable pour la mise a jour' });
        }
        const populated = await article.populate('author', 'name email');
        res.status(200).json(populated);
    } catch (err) {
        res.status(500).json ({ message : err.message }) ;
    }
};


// 5. Supprimer un article (DELETE /api/articles/:id)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article introuvable pour la suppression' });
        }
        res.status(200).json({ message: 'Article supprime avec succes', id: req.params.id });
    } catch (err) {
        res.status(500).json ({ message : err.message }) ;
    }
};

// Exportation CommonJS : on rend ces fonctions publiques
module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle };
