# Hệ Thống Quản Lý Nhân Sự (HR Management System)

Ứng dụng web quản lý nhân sự được xây dựng với MERN Stack (MongoDB, Express.js, React, Node.js).

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 16.x trở lên ([Tải Node.js](https://nodejs.org/))
- **MongoDB**: Phiên bản 6.x trở lên
- **npm**: Đi kèm với Node.js

---

## 🗄️ Cài Đặt MongoDB

### Cách 1: Cài đặt MongoDB cục bộ (Local)

1. **Tải MongoDB Community Server** tại: https://www.mongodb.com/try/download/community

2. **Cài đặt** theo hướng dẫn, chọn "Complete" installation

3. **Khởi động MongoDB Service**:
   - MongoDB sẽ tự động chạy như Windows Service
   - Hoặc chạy thủ công: `mongod`

4. **Kiểm tra kết nối**:
   ```bash
   mongosh
   ```

### Cách 2: Sử dụng MongoDB Atlas (Cloud)

1. Truy cập https://www.mongodb.com/cloud/atlas

2. Đăng ký tài khoản miễn phí và tạo cluster

3. Tạo Database User và lấy Connection String

4. Connection String có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

---

## ⚙️ Cấu Hình Kết Nối MongoDB

### Tạo file cấu hình Backend

1. Vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Tạo file `.env` với nội dung sau:

   **Với MongoDB Local:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hr_management
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h
   ```

   **Với MongoDB Atlas:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/hr_management?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h
   ```

> ⚠️ **Lưu ý**: Thay `<username>`, `<password>` bằng thông tin thực của bạn.

---

## 🚀 Chạy Ứng Dụng

### Bước 1: Cài đặt dependencies

Mở **2 terminal** riêng biệt:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Bước 2: Chạy Backend Server

```bash
cd backend
npm run dev
```

✅ Backend sẽ chạy tại: http://localhost:5000

### Bước 3: Chạy Frontend

```bash
cd frontend
npm start
```

✅ Frontend sẽ chạy tại: http://localhost:3000

---

## 👤 Tạo Tài Khoản Admin

Chạy lệnh sau trong thư mục `backend`:

```bash
cd backend
npm run create-admin
```

**Tài khoản mặc định:**
- Username: `admin`
- Password: `admin123`


