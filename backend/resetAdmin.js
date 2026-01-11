const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.log('MongoDB connection error:', err);
        process.exit(1);
    });

const resetAdmin = async () => {
    try {
        // Tìm tài khoản admin
        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            console.log('❌ Không tìm thấy tài khoản admin!');
            console.log('Hãy chạy: node createAdmin.js');
            process.exit(0);
        }

        // Reset mật khẩu và kích hoạt tài khoản
        admin.password = 'admin123';
        admin.isActive = true;
        await admin.save();

        console.log('✅ Reset tài khoản admin thành công!');
        console.log('================================');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('isActive: true');
        console.log('================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

// Chạy hàm reset
resetAdmin();
