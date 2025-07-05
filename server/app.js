require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Routes
const generateRoute = require('./routes/generate');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/portfolios', express.static(path.join(__dirname, 'portfolios')));

// ✅ Register the generate route
app.use('/api/generate', generateRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));