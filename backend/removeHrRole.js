const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        // Find all users with hr role and change to employee
        const hrUsers = await User.find({ role: 'hr' });

        console.log(`\n=== TÌM THẤY ${hrUsers.length} TÀI KHOẢN CÓ ROLE 'hr' ===\n`);

        for (const user of hrUsers) {
            await User.findByIdAndUpdate(user._id, { role: 'employee' });
            console.log(`✅ ${user.username}: hr → employee`);
        }

        console.log('\n=== HOÀN THÀNH XÓA ROLE HR ===\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
