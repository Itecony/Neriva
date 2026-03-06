require('dotenv').config();
const { sequelize } = require('./database');
const { User } = require('../models');
// Note: Depending on how index.js exports models, we might strictly need:
// const db = require('../models'); const User = db.User;

const runSeed = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Ensure connection
        await sequelize.authenticate();

        // Create a demo user if not exists
        const [user, created] = await User.findOrCreate({
            where: { email: 'demo@neriva.com' },
            defaults: {
                username: 'NerivaDemo',
                password: 'password123', // In a real app, this should be hashed!
                role: 'user' // Adjust based on your User model schema
            }
        });

        if (created) {
            console.log('✅ Created demo user: demo@neriva.com / password123');
        } else {
            console.log('ℹ️  Demo user already exists.');
        }

        console.log('✅ Database seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
