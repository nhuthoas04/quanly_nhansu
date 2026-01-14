# Hướng Dẫn Chạy Đồ Án Quản Lý Nhân Sự (Docker Version)

Dự án này đã được cấu hình để chạy trên Docker, kết nối trực tiếp với MongoDB có sẵn trên máy (Localhost).

## � Cài Đặt Từ GitHub

Nếu bạn vừa tải source code này về từ GitHub, hãy làm theo các bước sau:

1. **Clone repository:**
   ```bash
   git clone <link-github-cua-ban>
   cd quanlinhansu_web
   ```

   > **Lưu ý:** Bạn **KHÔNG** cần chạy lệnh `npm install`. Docker sẽ tự động cài đặt các thư viện cần thiết bên trong container.

2. **Kiểm tra file cấu hình:**
   - Đảm bảo file `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile` đã có sẵn.

## �🛠 Yêu Cầu
1. **Docker Desktop** đã được cài đặt và đang chạy.
2. **MongoDB** đang chạy trên máy của bạn (Localhost:27017).

## 🚀 Cách Chạy

1. Mở terminal tại thư mục gốc của dự án.
2. Chạy lệnh sau để build và khởi động:

```bash
docker-compose up -d --build
```

- `-d`: Chạy ngầm (background).
- `--build`: Build lại nếu có thay đổi code.

## 🌐 Truy Cập

Sau khi khởi động thành công:
- **Web App (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **API Server (Backend)**: [http://localhost:5000](http://localhost:5000)
- **Database**: Sử dụng MongoDB local tại `localhost:27017`.

## 📦 Quản Lý

**Xem logs (khi có lỗi):**
```bash
docker-compose logs -f
```

**Dừng chương trình:**
```bash
docker-compose down
```

## ⚠️ Lưu Ý Quan Trọng
- **Dữ liệu**: Docker connect trực tiếp vào MongoDB trên máy bạn qua `host.docker.internal`. Dữ liệu sẽ được giữ nguyên như khi chạy code thường.
- **Cổng (Ports)**: Đảm bảo port `3000` và `5000` không bị chiếm dụng bởi chương trình khác (ví dụ: tắt `npm start` nếu đang chạy).
