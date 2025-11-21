const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// Compression middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Game statistics (in-memory)
let gameStats = {
    totalGames: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
    currentActivePlayers: 0
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Get game statistics
app.get('/api/stats', (req, res) => {
    res.json(gameStats);
});

// Update game statistics
app.post('/api/stats', (req, res) => {
    const { winner } = req.body;
    
    gameStats.totalGames++;
    
    if (winner === 'X') {
        gameStats.xWins++;
    } else if (winner === 'O') {
        gameStats.oWins++;
    } else if (winner === 'draw') {
        gameStats.draws++;
    }
    
    res.json({ success: true, stats: gameStats });
});

// Reset statistics
app.post('/api/stats/reset', (req, res) => {
    gameStats = {
        totalGames: 0,
        xWins: 0,
        oWins: 0,
        draws: 0,
        currentActivePlayers: 0
    };
    res.json({ success: true, message: 'Statistics reset' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Tic-Tac-Toe Game Server`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

