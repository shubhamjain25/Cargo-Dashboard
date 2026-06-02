const express = require('express');
const multer = require('multer');
const Cargo = require('../models/Cargo');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure Multer to store the uploaded file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper function: Check if a number is prime
const isPrime = (num) => {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i * i <= num; i += 2) {
        if (num % i === 0) {
            return false;
        }
    }

    return true;
};

// POST /api/upload - Protected by Token and Admin Clearance
router.post('/upload', verifyToken, requireAdmin, upload.single('manifest'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No manifest file uploaded.' });
        }

        // Convert the file buffer to a string and split by new lines
        const fileContent = req.file.buffer.toString('utf-8');
        const lines = fileContent.split(/\r?\n/);
        const validRecords = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            // Parse format: [Date] || ID :: Weight >> Destination
            // Example: [2026-03-29] || CRG-012 :: 100 >> Sector-7 Command Center
            const dateMatch = line.match(/\[(\d{4}-\d{2}-\d{2})\]/);
            if (!dateMatch) continue;
            const createdAt = new Date(dateMatch[1]);

            const parts = line.split('::');
            if (parts.length < 2) continue;

            // Extract ID from the part before ::
            // Format: [Date] || ID
            const idMatch = parts[0].match(/\|\|\s*(.+?)$/);
            if (!idMatch) continue;
            const id = idMatch[1].trim();

            const dataPart = parts[1]; // " 100 >> Sector-7 Command Center"
            const splitData = dataPart.split('>>');
            if (splitData.length < 2) continue;

            let weight = parseFloat(splitData[0].trim());
            const destination = splitData[1].trim();

            // Business Rule 1: Sector-7 Multiplier
            if (destination.includes('Sector-7')) {
                weight = weight * 1.45;
            }

            // Business Rule 2: Rounding
            weight = Math.round(weight);

            // Business Rule 3: Prime Rejection
            if (!isPrime(weight)) {
                validRecords.push({ id, weight, destination, createdAt });
            }
        }

        // Insert all valid records into the database
        if (validRecords.length > 0) {
            await Cargo.insertMany(validRecords);
        }

        res.status(200).json({ 
            message: 'Manifest processed successfully', 
            recordsSaved: validRecords.length 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during file processing' });
    }
});

// GET /api/cargo - Fetch all cargo (Any authenticated user)
router.get('/cargo', verifyToken, async (req, res) => {
    try {
        const cargoList = await Cargo.find();
        res.status(200).json(cargoList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching cargo' });
    }
});

module.exports = router;