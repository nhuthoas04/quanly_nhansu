const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const Employee = require('./models/Employee');
const User = require('./models/User');
const Position = require('./models/Position');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.log('MongoDB connection error:', err);
        process.exit(1);
    });

async function createUsersForEmployees() {
    try {
        console.log('🔄 Tạo tài khoản cho nhân viên hiện có...\n');

        // Get all employees
        const employees = await Employee.find({}).populate('position');

        console.log(`Tìm thấy ${employees.length} nhân viên\n`);

        for (const emp of employees) {
            // Check if user already exists for this employee
            const existingUser = await User.findOne({ employee: emp._id });
            if (existingUser) {
                console.log(`⏭️  ${emp.employeeId} - ${emp.fullName}: Đã có tài khoản (${existingUser.username})`);
                continue;
            }

            // Check if email already used
            const emailUser = await User.findOne({ email: emp.email });
            if (emailUser) {
                console.log(`⚠️  ${emp.employeeId} - ${emp.fullName}: Email đã được sử dụng`);
                continue;
            }

            // Determine role based on position
            let userRole = 'employee';
            if (emp.position) {
                const posName = emp.position.name.toLowerCase();
                if (posName.includes('giám đốc') || posName.includes('director')) {
                    userRole = 'admin';
                } else if (posName.includes('trưởng phòng') || posName.includes('quản lý') || posName.includes('manager')) {
                    userRole = 'manager';
                } else if (posName.includes('nhân sự') || posName.includes('hr')) {
                    userRole = 'hr';
                }
            }

            // Create user
            const user = await User.create({
                username: emp.employeeId.toLowerCase(),
                email: emp.email,
                password: 'nhanvien123',
                fullName: emp.fullName,
                role: userRole,
                employee: emp._id
            });

            console.log(`✅ ${emp.employeeId} - ${emp.fullName}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Password: nhanvien123`);
            console.log(`   Role: ${user.role}`);
            console.log('');
        }

        console.log('================================');
        console.log('✅ Hoàn thành!');
        console.log('Tất cả nhân viên có thể đăng nhập với:');
        console.log('- Username: mã nhân viên (vd: nv001, tp001)');
        console.log('- Password: nhanvien123');
        console.log('================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Run
createUsersForEmployees();
