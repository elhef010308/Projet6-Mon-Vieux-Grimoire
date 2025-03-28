const Book = require('../models/book');
const sharp = require('sharp'); /* Pour optimiser un fichier image */
const fs = require('fs');       /* Pour supprimer un fichier image */
const path = require('path');


//  POST : Créer une donnée livre
exports.createBook = async (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;          /* L'ID est fournit automatiquement par MongoDB */
        delete bookObject._userId;      /* userID est déjà définit par l'authentification */
        
        const originalPath = req.file.path;    /* L'image d'origine */
        const fileName = `${Date.now()}.webp`  /* Renommer le format de l'image avant de la convertir */
        const optimizedPath = path.join('images', fileName);  /* Renommer le fichier image final */

        // Optimiser l'image avant de l'enregistrer
        await sharp(originalPath)
            .resize({ width: 800 })  /* bloquer à 800px de largeur */
            .webp({ quality: 80 })   /* réduire et convertir l'image */
            .toFile(optimizedPath)   /* nom du fichier optimisé */

        // Supprimer l'image d'origine (facultatif)
        fs.unlink(originalPath, (error) => {
            if(error) {
                console.error('Erreur lors de la suppression du fichier image :', error);
            }
        });

        // Création de la donnée livre avec une image optimisée
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${fileName}`,
            ratings: [],
            averageRating: 0
        });

        await book.save()
        res.status(201).json({ message: 'Livre ajouté avec succès' });
    } catch {
        console.error('Erreur lors de la création du livre :', error);
        res.status(400).json({ error });
    }
};


// POST : Définir la note moyenne d'un livre
exports.noteBook = (req, res, next) => {
    const userRating = req.body.rating;  /* La note envoyée par l'utilisateur */
    const bookId = req.params.id;        /* L'identifiant du livre récupéré dans l'URL */

    /* Trouver le livre dans la base de données */
    Book.findOne({ _id: bookId })
        .then(book => {
            /* Si e livre n'est pas trouvé */
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' })
            }

            /* Vérifier si l'utilisateur a déjà noté le livre */
            const existingRating = book.ratings.find(rating => rating.userId === req.auth.userId);
                if(existingRating) {
                    return res.status(403).json({ message: 'Vous avez déjà noté ce livre' });
                }

            /* Si ce n'est pas le cas et que le livre est trouvé */
            book.ratings.push({ userId: req.auth.userId, grade: userRating })

            /* ETAPE 1 : additionner toutes les notes */
            let somme = 0;
            book.ratings.forEach(note => {
                somme += note.grade;
            });

            /* ETAPE 2 : calculer la note moyenne du livre */
            const moyenne = (somme / book.ratings.length).toFixed(2); // arrondir la note moyenne

            /* ETAPE 3 : ajouter la moyenne à la donnée 'livre' */
            book.averageRating = moyenne;

            book.save()
                .then(() => res.status(200).json({
                    message: 'Note ajoutée avec succès',
                    averageRating: moyenne
                }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


// GET : Renvoyer les données de tous les livres
exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};


// GET : Renvoyer les données d'un livre (en particulier)
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};


// GET = Renvoyer les données des 3 livres ayant la meilleure note
exports.bestThreeBook = async (req, res, next) => {
    try {
        const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(bestBooks);
    } catch (error) {
        res.status(500).json({ error });
    }
};


// PUT : Modifier un livre 
exports.modifyBook = (req, res, next) => {
    /* REQ.FILE = un fichier image */
    /* Si une nouvelle image est envoyée on exécute la première partie "? { }" */
    /* Si aucune nouvelle image on exécute la seconde ": { }" */
    const bookObject = req.file 
    ? {
        ...JSON.parse(req.body.book),  /* Transformer les données JSON en objet JS */
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; /* Si aucune nouvelle image on prend simplement toutes les données renvoyées */

    delete bookObject._userId;  /* userID est déjà définit par l'authentification */

    Book.findOne({ _id: req.params.id }) /* Cherche un livre par son _id fourni dans l'URL (via req.params.id) */
        /* Une fois le livre trouvé on vérifie si l'utilisateur connecté est bien le créateur de l'objet livre à modifier */
        .then(book => {
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: 'Non autorisé' })
            } /* Si l'utilisateur n'est pas le créateur du livre on renvoie une erreur */

            /* Si l'utilisateur est le créateur du livre on enregistre les modifications */
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                /* Précise l'ID du livre à mettre à jour */ /* Précise les modifications à effectuer */
                .then(() => res.status(200).json({ message: 'Objet Modifié' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error })); /* Erreur si le livre n'est pas trouvé */
};


// DELETE : Supprimer un livre
exports.deleteBook = (req, res, next) => {
    /* Chercher un livre par rapport à son ID généré par MongoDB */
    /* ID du livre fournit dans l'URL */
    Book.findOne({ _id: req.params.id })
        /* Une fois le livre trouvé */
        .then(book => {
            /* Si ce n'est pas le créateur du livre, l'utilisateur ne peut pas le modifier */
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: 'Non autorisé' });
            }

            /* On veut récupérer l'ID de l'image :
                1- on récupère l'URL de que l'on coupe en deux parties à l'endroit "/image" (nom du dossier où est stocké le fichier)
                 --> PARTIE 1 = verbe HTTP + domaine
                 -- PARTIE 2 = nom du fichier 
                2- on récupère seulement la deuxième partie via son index : [1] 
            */
            const filename = book.imageUrl.split('/images/')[1];

            /* On supprime ensuite le FICHIER image via FS */
            fs.unlink(`images/${filename}`, (error) => {
                if (error) {
                    return res.status(500).json({ error });
                }

                /* On supprime le LIVRE de la base de données */
                Book.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(404).json({ error })); /* Gestion des erreurs de la requête */
};

