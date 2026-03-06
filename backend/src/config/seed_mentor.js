require('dotenv').config();
const { sequelize } = require('./database');
const { User, MentorProfile } = require('../models');

const seedMentor = async () => {
    try {
        console.log('🌱 Seeding Mentor...');
        await sequelize.authenticate();

        // 1. Create or Find Mentor User
        const [user, created] = await User.findOrCreate({
            where: { email: 'mentor@neriva.com' },
            defaults: {
                username: 'NerivaMentor',
                firstName: 'Master',
                lastName: 'Mentor',
                password: 'password123', // In real app, hash this!
                role: 'user', // Basic role
                is_mentor: true,
                mentor_verified_at: new Date(),
                can_apply_mentor: false
            }
        });

        if (created) {
            console.log('✅ Created User: mentor@neriva.com');
        } else {
            console.log('ℹ️  User already exists. Updating mentor status...');
            user.is_mentor = true;
            user.mentor_verified_at = new Date();
            await user.save();
        }

        // 2. Create Mentor Profile
        const [profile, profileCreated] = await MentorProfile.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                bio: 'I am a seeded mentor experienced in Full Stack Development.',
                expertise_domains: ['React', 'Node.js', 'Mentorship'],
                teaching_style: 'Hands-on project-based learning.',
                open_to_mentorship: true
            }
        });

        if (profileCreated) {
            console.log('✅ Created Mentor Profile.');
        } else {
            console.log('ℹ️  Mentor Profile already exists.');
        }

        console.log('🎉 Mentor Seed Complete!');
        console.log('📧 Email: mentor@neriva.com');
        console.log('🔑 Password: password123');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedMentor();
