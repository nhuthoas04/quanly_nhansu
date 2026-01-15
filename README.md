# Hướng Dẫn Chạy Đồ Án Quản Lý Nhân Sự

Dự án này sử dụng **MongoDB Atlas** (Cloud Database), bạn **KHÔNG cần cài MongoDB** trên máy.

## 📦 Cài Đặt Từ GitHub

1. **Clone repository:**
   ```bash
   git clone <link-github-cua-ban>
   cd quanlinhansu_web
   ```

2. **Cấu hình Backend:**
   ```bash
   cd backend
   copy .env.example .env
   ```
   
   Mở file `.env` và thay `YOUR_PASSWORD` bằng password MongoDB Atlas thật.

3. **Cài đặt dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend  
   cd ../frontend
   npm install
   ```

## � Cách Chạy (Không dùng Docker)

**Chạy Backend:**
```bash
cd backend
npm start
```

**Chạy Frontend (terminal mới):**
```bash
cd frontend
npm start
```

## � Cách Chạy (Docker)

Nếu muốn dùng Docker:
```bash
docker-compose up -d --build
```

> **Lưu ý:** Bạn **KHÔNG** cần chạy `npm install` khi dùng Docker.

## 🌐 Truy Cập

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Database**: MongoDB Atlas (Cloud)

## � Tài Khoản Mặc Định

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

## ⚠️ Lưu Ý

- **MongoDB Atlas**: Dữ liệu được lưu trữ trên cloud, bạn không cần cài MongoDB local.
- **Network**: Đảm bảo máy có kết nối internet để connect tới Atlas.
- **Ports**: Đảm bảo port `3000` và `5000` không bị chiếm.

## 📦 Quản Lý Docker

```bash
# Xem logs
docker-compose logs -f

# Dừng chương trình
docker-compose down
```
