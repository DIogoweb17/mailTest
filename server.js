require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Route d'accueil
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour envoyer un email
router.post('/send-email', async (req, res) => {
    const { nom, prenom, email, message } = req.body;

    // Vérification des variables d'environnement
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({
            success: false,
            message: 'Erreur : Variables d\'environnement EMAIL_USER ou EMAIL_PASS non définies.'
        });
    }

    try {
        console.log('Tentative d\'envoi de l\'email...');
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Envoi de l'email
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Nouveau message de ${prenom} ${nom}`,
            text: `Nom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\n\nMessage:\n${message}`
        };

        console.log('Envoi de l\'email...');
        await transporter.sendMail(mailOptions);

        console.log('Email envoyé avec succès !');
        res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email : ", error);
        // Renvoyer une erreur plus spécifique en fonction du type d'erreur
        res.status(500).json({
            success: false,
            message: `Erreur lors de l'envoi de l'email : ${error.message}`
        });
    }
});

// Utiliser le routeur
app.use('/api', router);

// Exporter Express pour Vercel
module.exports = app;
