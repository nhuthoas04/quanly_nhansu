const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        // List all users và test password
        const users = await User.find({}).select('+password username email role createdAt');

        console.log('\n=== TẤT CẢ TÀI KHOẢN ===\n');

        for (const user of users) {
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Created: ${user.createdAt}`);

            // Test nhanvien123
            const test = await user.matchPassword('nhanvien123');
            console.log(`Password "nhanvien123": ${test ? '✅ MATCH' : '❌ NO'}`);
            console.log('---');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
