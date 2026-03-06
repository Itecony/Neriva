
require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Add teaching_style column
        try {
            await sequelize.query('ALTER TABLE mentor_applications ADD COLUMN "teaching_style" TEXT;');
            console.log('Added teaching_style column.');
        } catch (e) {
            console.log('teaching_style column likely exists or error:', e.message);
        }

        // Add mentorship_goals column
        try {
            await sequelize.query('ALTER TABLE mentor_applications ADD COLUMN "mentorship_goals" TEXT;');
            console.log('Added mentorship_goals column.');
        } catch (e) {
            console.log('mentorship_goals column likely exists or error:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

updateSchema();
