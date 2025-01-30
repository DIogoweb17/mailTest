require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Pour gérer les chemins de fichiers

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route pour envoyer un email
app.post('/send-email', async (req, res) => {
    const { nom, prenom, email, message } = req.body;

    try {
        // Configurer Nodemailer pour envoyer l'email à toi-même
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Contenu de l'email à toi-même
        const mailOptionsToYou = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Nouveau message de ${prenom} ${nom}`,
            text: `Nom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\n\nMessage:\n${message}`,
            attachments: [
                {
                    filename: 'guide_gratuit.pdf',  // Le nom du fichier à envoyer
                    path: path.join(__dirname, 'public', 'pdfs', 'guide_gratuit.pdf')  // Le chemin vers ton fichier PDF
                }
            ]
        };

        // Envoyer l'email à toi-même avec le PDF
        await transporter.sendMail(mailOptionsToYou);

        // Contenu de l'email de confirmation à l'utilisateur avec le PDF en pièce jointe
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Voici votre guide gratuit',
            text: `Bonjour ${prenom} ${nom},\n\nMerci d\'avoir téléchargé notre guide !\n\nNous avons bien reçu votre message et voici le guide demandé en pièce jointe.\n\nVotre message :\n"${message}"`,
            attachments: [
                {
                    filename: 'guide_gratuit.pdf',  // Le nom du fichier à envoyer
                    path: path.join(__dirname, 'public', 'pdfs', 'guide_gratuit.pdf')  // Le chemin vers ton fichier PDF
                }
            ]
        };

        // Envoyer l'email de confirmation avec le PDF en pièce jointe
        await transporter.sendMail(mailOptionsToUser);

        res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email.' });
    }
});

// Lancer le serveur
app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
