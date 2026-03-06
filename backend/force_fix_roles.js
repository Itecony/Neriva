require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

const forceFixRoles = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find all verified mentors
        const verifiedMentors = await User.findAll({
            where: {
                is_mentor: true
            }
        });

        console.log(`Found ${verifiedMentors.length} verified mentors.`);

        for (const user of verifiedMentors) {
            console.log(`Checking user: ${user.email} | Role: ${user.role} | is_mentor: ${user.is_mentor}`);

            // If role is NOT 'mentor' and NOT 'admin', force update to 'mentor'
            if (user.role !== 'mentor' && user.role !== 'admin') {
                console.log(`>>> UPDATING role from '${user.role}' to 'mentor'`);
                user.role = 'mentor';
                await user.save();
                console.log(`>>> DONE.`);
            } else {
                console.log(`>>> Role is OK (${user.role}).`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

forceFixRoles();
