const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// MongoDB connection string
const uri = "mongodb+srv://ritika:ritika23@cluster0.7f88b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Auth0 configuration
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:3000',
    clientID: 'hWgvnhLfidGOFaf9si6IZkWY2gb4zqgn',
    issuerBaseURL: 'https://dev-uiywzaum72ea1fzj.us.auth0.com'
};

// Connect to MongoDB
client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB: " + err);
    });

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(auth(config));

const API_KEY = '42b95dd2ca7bfc91ab43ddc7'; // Replace with your actual API key
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

app.post('/convert-currency', async (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;

    try {
        const response = await fetch(`${API_URL}/${fromCurrency}`);
        const data = await response.json();
        
        if (data.result === 'success') {
            const conversionRate = data.conversion_rates[toCurrency];
            const convertedAmount = (amount * conversionRate).toFixed(2);
            res.json({ convertedAmount });
        } else {
            res.status(500).json({ message: 'Error fetching conversion rate' });
        }
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile',requiresAuth(), (req, res) => {
    res.json(req.oidc.user);
});


// Add food item
app.post('/add-food', async (req, res) => {
    const { name, cost } = req.body;
    const db = client.db('kiosk');
    const collection = db.collection('menu');

    try {
        await collection.insertOne({ name, cost });
        res.json({ message: "Inserted" });
    } catch (err) {
        console.error('Error adding food item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get food items
app.get('/get-food', async (req, res) => {
    const db = client.db('kiosk');
    const collection = db.collection('menu');

    try {
        const foodItems = await collection.find().toArray();
        res.json(foodItems);
    } catch (err) {
        console.error('Error fetching food items:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update food item
app.post('/update-food/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cost } = req.body;
    const db = client.db('kiosk');
    const collection = db.collection('menu');

    try {
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name: name, cost: cost } }
        );
        res.status(200).json({ message: 'Food item updated' });
    } catch (err) {
        console.error('Error updating food item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete food item
app.delete('/delete-food/:id', async (req, res) => {
    const { id } = req.params;
    const db = client.db('kiosk');
    const collection = db.collection('menu');

    try {
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: 'Food item deleted' });
    } catch (err) {
        console.error('Error deleting food item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
