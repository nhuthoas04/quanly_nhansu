/**
 * Script để migrate dữ liệu từ MongoDB Local sang MongoDB Atlas
 * Chạy: node migrateToAtlas.js
 */

const mongoose = require('mongoose');
const readline = require('readline');

// Connection strings
const LOCAL_URI = 'mongodb://localhost:27017/hr_management';
// THAY <db_password> bằng password thật của bạn
const ATLAS_URI = 'mongodb+srv://nhuthoas04:<db_password>@cluster0.awyu0je.mongodb.net/hr_management?retryWrites=true&w=majority&appName=Cluster0';

// Danh sách các collections cần migrate
const COLLECTIONS = [
    'users',
    'employees',
    'departments',
    'positions',
    'contracts',
    'salaries',
    'leaves',
    'attendances',
    'permissions',
    'roles'
];

async function migrateData(atlasPassword) {
    const atlasUri = ATLAS_URI.replace('<db_password>', atlasPassword);

    console.log('🔄 Bắt đầu migrate dữ liệu...\n');

    // Kết nối MongoDB Local
    console.log('📡 Đang kết nối MongoDB Local...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Đã kết nối MongoDB Local!\n');

    // Kết nối MongoDB Atlas
    console.log('☁️  Đang kết nối MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
    console.log('✅ Đã kết nối MongoDB Atlas!\n');

    console.log('='.repeat(50));
    console.log('📦 Bắt đầu migrate các collections...');
    console.log('='.repeat(50) + '\n');

    let totalDocuments = 0;

    for (const collectionName of COLLECTIONS) {
        try {
            // Lấy collection từ local
            const localCollection = localConn.collection(collectionName);
            const documents = await localCollection.find({}).toArray();

            if (documents.length === 0) {
                console.log(`⏭️  ${collectionName}: Không có dữ liệu, bỏ qua.`);
                continue;
            }

            // Xóa dữ liệu cũ trên Atlas (nếu có)
            const atlasCollection = atlasConn.collection(collectionName);
            await atlasCollection.deleteMany({});

            // Insert dữ liệu lên Atlas
            await atlasCollection.insertMany(documents);

            console.log(`✅ ${collectionName}: Đã migrate ${documents.length} documents`);
            totalDocuments += documents.length;

        } catch (error) {
            console.log(`❌ ${collectionName}: Lỗi - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`🎉 HOÀN THÀNH! Đã migrate ${totalDocuments} documents`);
    console.log('='.repeat(50));

    // Đóng kết nối
    await localConn.close();
    await atlasConn.close();

    console.log('\n📝 Bước tiếp theo:');
    console.log('   1. Cập nhật file .env với MONGODB_URI của Atlas');
    console.log('   2. Khởi động lại backend server');
    console.log('   3. Test ứng dụng\n');
}

// Hỏi password từ người dùng
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🚀 MIGRATE MONGODB LOCAL → ATLAS');
console.log('================================\n');

rl.question('Nhập password MongoDB Atlas: ', async (password) => {
    rl.close();

    if (!password) {
        console.log('❌ Password không được để trống!');
        process.exit(1);
    }

    try {
        await migrateData(password);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        if (error.message.includes('bad auth')) {
            console.log('   → Password không đúng, vui lòng kiểm tra lại!');
        }
        if (error.message.includes('ECONNREFUSED')) {
            console.log('   → Không thể kết nối MongoDB Local. Hãy chắc chắn MongoDB đang chạy!');
        }
        if (error.message.includes('network')) {
            console.log('   → Kiểm tra Network Access trên Atlas (cho phép IP 0.0.0.0/0)');
        }
        process.exit(1);
    }
});
