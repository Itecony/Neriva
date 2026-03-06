require('dotenv').config();
const { User, MentorApplication } = require('./src/models');
const { sequelize } = require('./src/config/database');

const debugMentorData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('--- Checking for inconsistencies ---');

        // 1. Find all Approved Mentor Applications
        const approvedApps = await MentorApplication.findAll({
            where: { status: 'approved' },
            include: [{ model: User, as: 'applicant' }] // Note: alias might be 'user' or 'applicant' depending on definition
        });

        console.log(`Found ${approvedApps.length} approved applications.`);

        for (const app of approvedApps) {
            // Check user status
            const user = await User.findByPk(app.user_id);
            if (!user) {
                console.log(`[WARNING] Application ${app.id} has no user (user_id: ${app.user_id})`);
                continue;
            }

            console.log(`App ID: ${app.id}, User: ${user.email}, Role: ${user.role}, is_mentor: ${user.is_mentor}`);

            if (user.role === 'user' && user.role !== 'admin') {
                console.log(` -> [ISSUE] User has approved application but role is 'user'. Fixing...`);
                user.role = 'mentor';
                user.is_mentor = true; // Ensure this is true too
                await user.save();
                console.log(` -> Fixed.`);
            } else if (!user.is_mentor) {
                console.log(` -> [ISSUE] User has approved application but is_mentor is false. Fixing...`);
                user.is_mentor = true;
                if (user.role !== 'admin') user.role = 'mentor';
                await user.save();
                console.log(` -> Fixed.`);
            }
        }

        // 2. Check for users who are 'mentor' role but don't have is_mentor flag (just in case)
        const mentorUsers = await User.findAll({ where: { role: 'mentor' } });
        console.log(`Found ${mentorUsers.length} users with 'mentor' role.`);
        for (const u of mentorUsers) {
            if (!u.is_mentor) {
                console.log(` -> [ISSUE] User ${u.email} has 'mentor' role but is_mentor=false. Fixing...`);
                u.is_mentor = true;
                await u.save();
            }
        }

    } catch (error) {
        console.error('Error debugging data:', error);
    } finally {
        await sequelize.close();
    }
};

debugMentorData();
