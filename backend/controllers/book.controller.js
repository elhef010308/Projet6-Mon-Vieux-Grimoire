const Book = require('../models/book');
const sharp = require('sharp');  // Pour optimiser un fichier image
const fs = require('fs');        // Pour supprimer un fichier image
const path = require('path');


//  POST : Créer une donnée livre
exports.createBook = async (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;         
        delete bookObject._userId;      
        
        const originalPath = req.file.path;    // L'image d'origine
        const fileName = `${Date.now()}.webp` 
        const optimizedPath = path.join('images', fileName);  

        // Optimiser l'image avant de l'enregistrer
        await sharp(originalPath)
            .resize({ width: 800 })  
            .webp({ quality: 80 })   
            .toFile(optimizedPath)   

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

    // Trouver le livre dans la base de données
    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' })
            }

            // Vérifier si l'utilisateur a déjà noté le livre
            const existingRating = book.ratings.find(rating => rating.userId === req.auth.userId);
                if(existingRating) {
                    return res.status(403).json({ message: 'Vous avez déjà noté ce livre' });
                }

            
            book.ratings.push({ userId: req.auth.userId, grade: userRating })

            // ETAPE 1 : additionner toutes les notes
            let somme = 0;
            book.ratings.forEach(note => {
                somme += note.grade;
            });

            // ETAPE 2 : calculer la note moyenne du livre 
            const moyenne = (somme / book.ratings.length).toFixed(2); 

            // ETAPE 3 : ajouter la moyenne à la donnée 'livre'
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
    /* Si une nouvelle image est envoyée on exécute la première partie "? { }"
       Si aucune nouvelle image on exécute la seconde ": { }" */
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file 
    ? {
        ...JSON.parse(req.body.book),  // Transformer les données JSON en objet JS
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; 

    delete bookObject._userId; 

    Book.findOne({ _id: req.params.id }) // Récupérer l'_id du livre fourni dans l'URL
        .then(book => {
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: 'Non autorisé' })
            }

                      // ID du livre à mettre à jour     Modifications à effectuer
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet Modifié' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error }));
};


// DELETE : Supprimer un livre
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })       // Seul le créateur du livre peut le modifier
        .then(book => { 
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: 'Non autorisé' });
            }

            const filename = book.imageUrl.split('/images/')[1];  // Récupérer l'URL de l'image et récupérer le nom du fichier

            // Suppression du fichier image
            fs.unlink(`images/${filename}`, (error) => {
                if (error) {
                    return res.status(500).json({ error });
                }

                // Suppression de la donnée 'livre'
                Book.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(404).json({ error }));
};

