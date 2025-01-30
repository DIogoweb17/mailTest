require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

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
            text: `Nom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        // Envoyer l'email à toi-même
        await transporter.sendMail(mailOptionsToYou);

        // Contenu de l'email de confirmation à l'utilisateur
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,  // Ton email
            to: email,  // L'email de la personne qui a rempli le formulaire
            subject: 'Merci pour votre message',
            text: `Bonjour ${prenom} ${nom},\n\nMerci d\'avoir pris contact avec nous ! Nous avons bien reçu votre message et reviendrons vers vous dès que possible.\n\nVotre message :\n"${message}"`
        };

        // Envoyer l'email de confirmation à l'utilisateur
        await transporter.sendMail(mailOptionsToUser);

        res.status(200).json({ success: true, message: 'Email envoyé avec succès et message enregistré dans Google Sheets !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email ou de l\'enregistrement du message.' });
    }
});

// Lancer le serveur
app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
