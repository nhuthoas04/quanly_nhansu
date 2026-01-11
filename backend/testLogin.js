const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        // Get the newest user (most recently created)
        const user = await User.findOne({}).sort({ createdAt: -1 }).select('+password');

        if (!user) {
            console.log('No users found');
            process.exit(1);
        }

        console.log('\n=== USER MỚI NHẤT ===');
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Created: ${user.createdAt}`);
        console.log(`Password hash: ${user.password?.substring(0, 20)}...`);

        // Test with nhanvien123
        console.log('\n--- Test passwords ---');
        const test1 = await user.matchPassword('nhanvien123');
        console.log(`"nhanvien123": ${test1 ? 'MATCH ✅' : 'NO MATCH ❌'}`);

        const test2 = await user.matchPassword('123456');
        console.log(`"123456": ${test2 ? 'MATCH ✅' : 'NO MATCH ❌'}`);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
