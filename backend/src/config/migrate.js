require('dotenv').config();
const { sequelize } = require('./database');
const path = require('path');
const fs = require('fs');

// Import all models to ensure they are registered with Sequelize
const modelsPath = path.join(__dirname, '../models');
fs.readdirSync(modelsPath).forEach(file => {
    if (file.endsWith('.js') && file !== 'index.js') {
        require(path.join(modelsPath, file));
    }
});

// Also require index.js to handle associations
require('../models/index');

const runMigration = async () => {
    try {
        console.log('🔄 Starting database migration...');
        // Sync all defined models to the DB
        // alter: true adds columns/tables if missing, but tries not to delete data
        await sequelize.sync({ alter: true });
        console.log('✅ Database migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
