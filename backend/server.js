const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//ADDED as part of T1.3
const authRoutes = require('./routes/auth');

//ADDED as part of T2.3
const cargoRoutes = require('./routes/cargo'); // Add this line

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON payloads
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is operational' });
});

//ADDED as part of T1.3
app.use('/api', authRoutes);

//ADDED as part of T2.3
app.use('/api', cargoRoutes); 

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Database');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });