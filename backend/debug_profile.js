
require('dotenv').config();
const { User, MentorApplication } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function testFetch() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find a user who has an application
        const app = await MentorApplication.findOne();
        if (!app) {
            console.log('No mentor applications found in DB to test with.');
            return;
        }
        console.log('Found an application for user_id:', app.user_id);

        // 2. Try to fetch that user with the include
        const user = await User.findByPk(app.user_id, {
            attributes: ['id', 'firstName', 'email'],
            include: [
                {
                    model: MentorApplication,
                    as: 'mentorApplications'
                }
            ]
        });

        if (!user) {
            console.log('User not found!');
        } else {
            console.log('User found:', user.email);
            console.log('Mentor Applications:', JSON.stringify(user.mentorApplications, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testFetch();
