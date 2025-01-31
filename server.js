require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware pour servir des fichiers statiques
app.use(express.static('public'));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.resolve('public', 'index.html'));
});

// Route pour éviter l'erreur 404 de favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Route pour envoyer un email
app.post('/send-email', async (req, res) => {
    const { nom, prenom, email, message } = req.body;

    try {
        // Configurer Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email vers toi-même
        const mailOptionsToYou = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Nouveau message de ${prenom} ${nom}`,
            text: `Nom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\n\nMessage:\n${message}`,
            attachments: [
                {
                    filename: 'guide_gratuit.pdf',
                    path: path.resolve('public', 'pdfs', 'guide_gratuit.pdf')
                }
            ]
        };

        await transporter.sendMail(mailOptionsToYou);

        // Email de confirmation à l'utilisateur
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Voici votre guide gratuit',
            text: `Bonjour ${prenom} ${nom},\n\nMerci d'avoir téléchargé notre guide !\n\nVoici le guide en pièce jointe.\n\nVotre message :\n"${message}"`,
            attachments: [
                {
                    filename: 'guide_gratuit.pdf',
                    path: path.resolve('public', 'pdfs', 'guide_gratuit.pdf')
                }
            ]
        };

        await transporter.sendMail(mailOptionsToUser);

        res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'email." });
    }
});

// Exporter l'application pour Vercel
module.exports = app;
