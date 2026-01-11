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

const createAdmin = async () => {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('❌ Tài khoản admin đã tồn tại!');
      console.log('Username: admin');
      process.exit(0);
    }

    // Tạo tài khoản admin mới
    const admin = await User.create({
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123',
      fullName: 'Administrator',
      role: 'admin'
    });

    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@company.com');
    console.log('Role: admin');
    console.log('================================');
    console.log('⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error.message);
    process.exit(1);
  }
};

// Chạy hàm tạo admin
createAdmin();
