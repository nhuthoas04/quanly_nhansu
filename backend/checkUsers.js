const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const Employee = require('./models/Employee');

        // List all users
        const users = await User.find({}).select('username email role isActive employee');
        console.log('\n=== TÀI KHOẢN ===');
        for (const u of users) {
            console.log(`[${u.username}] - ${u.email} - Role: ${u.role}`);
        }

        // List all employees
        const employees = await Employee.find({}).select('employeeId fullName email');
        console.log('\n=== NHÂN VIÊN ===');
        for (const e of employees) {
            // Check if user exists
            const user = await User.findOne({ employee: e._id });
            console.log(`[${e.employeeId}] ${e.fullName} - ${e.email}`);
            console.log(`   -> Tài khoản: ${user ? user.username : 'CHƯA CÓ'}`);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
