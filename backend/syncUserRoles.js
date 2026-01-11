const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const Employee = require('./models/Employee');
        const Position = require('./models/Position');

        // Get all users that are linked to employees
        const users = await User.find({ employee: { $exists: true, $ne: null } }).populate('employee');

        console.log(`\n=== ĐỒNG BỘ ROLE CHO ${users.length} TÀI KHOẢN ===\n`);

        for (const user of users) {
            if (!user.employee) {
                console.log(`⚠️ ${user.username}: Không có nhân viên liên kết`);
                continue;
            }

            // Get position of the employee
            const position = await Position.findById(user.employee.position);
            if (!position) {
                console.log(`⚠️ ${user.username}: Không tìm thấy chức vụ`);
                continue;
            }

            const positionName = position.name.toLowerCase();
            let newRole = 'employee';

            if (positionName.includes('giám đốc') || positionName.includes('director')) {
                newRole = 'admin';
            } else if (positionName.includes('trưởng phòng') || positionName.includes('quản lý') || positionName.includes('manager')) {
                newRole = 'manager';
            } else if (positionName.includes('nhân sự') || positionName.includes('hr')) {
                newRole = 'hr';
            }

            if (user.role !== newRole) {
                await User.findByIdAndUpdate(user._id, { role: newRole });
                console.log(`✅ ${user.username}: ${user.role} → ${newRole} (Chức vụ: ${position.name})`);
            } else {
                console.log(`✔️ ${user.username}: ${user.role} (Đã đúng - ${position.name})`);
            }
        }

        console.log('\n=== HOÀN THÀNH ===\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
