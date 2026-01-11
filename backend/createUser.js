const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Tạo interface để đọc input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hàm hỏi câu hỏi
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.log('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const createUser = async () => {
  try {
    console.log('\n========================================');
    console.log('   TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI');
    console.log('========================================\n');

    // Nhập thông tin
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const fullName = await question('Họ và tên: ');
    
    console.log('\nChọn vai trò:');
    console.log('1. Admin (Toàn quyền)');
    console.log('2. HR (Quản lý nhân sự)');
    console.log('3. Manager (Quản lý phòng ban)');
    console.log('4. Employee (Nhân viên thường)');
    
    const roleChoice = await question('Chọn (1-4): ');
    
    const roleMap = {
      '1': 'admin',
      '2': 'hr',
      '3': 'manager',
      '4': 'employee'
    };
    
    const role = roleMap[roleChoice] || 'employee';

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('\n❌ Username hoặc Email đã tồn tại!');
      rl.close();
      process.exit(1);
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role
    });

    console.log('\n✅ Tạo tài khoản thành công!');
    console.log('================================');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Họ tên:', user.fullName);
    console.log('Vai trò:', user.role);
    console.log('================================\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi tạo tài khoản:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Chạy hàm tạo user
createUser();
