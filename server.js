const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// *******************************************************************
// 🛑 CHAÎNE DE CONNEXION INTÉGRÉE (Votre clé secrète pour la mémoire)
// *******************************************************************
const MONGODB_URI = "mongodb+srv://Empirechain:Josie05*@cluster0.ar96sa0.mongodb.net/?appName=Cluster0"; 

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let db;

async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('EmpireChainDB'); // Nom de votre base de données
        console.log("🚀 Connecté à MongoDB. La mémoire de l'Empire est opérationnelle.");
    } catch (error) {
        console.error("❌ ERREUR DE CONNEXION À MONGO DB. Le serveur ne démarrera pas sans connexion :", error);
        // Nous n'appelons pas process.exit(1) ici pour que Vercel puisse démarrer correctement, même s'il y a des erreurs initiales.
    }
}

// ---------------------------------------------
// 👑 Route de Test : Sauvegarde de Richesse
// ---------------------------------------------
app.post('/api/save_wealth', async (req, res) => {
    // En phase alpha, l'ID est toujours 'TEST_USER_ALPHA'
    const userId = req.body.userId || 'TEST_USER_ALPHA'; 
    const { wealth, name } = req.body;

    if (!db) {
         return res.status(503).send({ message: "Serveur non connecté à la base de données. Veuillez réessayer." });
    }

    try {
        const collection = db.collection('players');
        await collection.updateOne(
            { _id: userId }, 
            { $set: { wealth: wealth, name: name, lastUpdated: new Date() } }, 
            { upsert: true }
        );

        res.status(200).send({ message: "Richesse EmpireChain sauvegardée avec succès!" });
    } catch (error) {
        console.error("Erreur de sauvegarde de richesse:", error);
        res.status(500).send({ message: "Erreur serveur lors de la sauvegarde." });
    }
});

// Route par défaut pour l'interface HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur APRES la connexion à la base de données
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Serveur Empire Chain démarré sur le port ${port}`);
    });
});
