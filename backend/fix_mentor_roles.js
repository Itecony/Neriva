require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

const fixMentorRoles = async () => {
    try {
        console.log('Connecting to database...');
        // We don't strictly need authenticate() as query will do it, but good for check
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find users who are verified mentors but don't have the mentor role (and are not admins)
        const mentorsToFix = await User.findAll({
            where: {
                is_mentor: true,
                role: 'user' // Only fix if currently 'user'
            }
        });

        console.log(`Found ${mentorsToFix.length} mentors with incorrect role.`);

        if (mentorsToFix.length > 0) {
            for (const user of mentorsToFix) {
                console.log(`Updating user ${user.email} (ID: ${user.id})...`);
                user.role = 'mentor';
                await user.save();
                console.log(`Updated ${user.email} to role 'mentor'.`);
            }
            console.log('All eligible mentors updated.');
        } else {
            console.log('No users needed fixing.');
        }

    } catch (error) {
        console.error('Error fixing mentor roles:', error);
    } finally {
        await sequelize.close();
    }
};

fixMentorRoles();
