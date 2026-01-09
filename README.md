<div align="center">

# 🚀 ZenTask - Nền tảng Quản lý Công việc Hiện đại

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37.7-52B0E7?style=for-the-badge&logo=sequelize)](https://sequelize.org/)
[![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

_🏆 Ứng dụng quản lý công việc toàn diện với giao diện đẹp, tính năng mạnh mẽ và trải nghiệm người dùng tuyệt vời_

[📖 Giới thiệu](#-giới-thiệu) • [✨ Tính năng](#-tính-năng) • [🛠️ Công nghệ](#-công-nghệ) • [🚀 Cài đặt](#-cài-đặt)
---

</div>

## 🌟 Giới thiệu

**ZenTask** là một nền tảng quản lý công việc hiện đại được thiết kế để tối ưu hóa năng suất cá nhân và hợp tác nhóm. Với giao diện trực quan, tính năng thông minh và khả năng mở rộng cao, ZenTask giúp bạn:

- ✅ **Tổ chức công việc hiệu quả** với bảng Kanban và danh mục thông minh
- 👥 **Hợp tác nhóm mượt mà** với workspaces và phân quyền chi tiết
- 📊 **Theo dõi tiến độ** với dashboard thống kê và báo cáo chi tiết
- 🔔 **Nhắc nhở thông minh** với hệ thống thông báo tự động
- 📱 **Trải nghiệm đa nền tảng** với thiết kế responsive hoàn hảo

## ✨ Tính năng

### 👤 Quản lý Người dùng

- 🔐 **Xác thực bảo mật** với JWT và mã hóa Bcrypt
- 📧 **Khôi phục mật khẩu** qua email
- 👤 **Quản lý hồ sơ** với avatar và thông tin cá nhân
- 🌙 **Chế độ tối/sáng** tùy chỉnh

### 🏢 Workspaces & Hợp tác

- 🏗️ **Tạo workspace** riêng biệt cho từng dự án
- 👥 **Mời thành viên** với hệ thống phân quyền linh hoạt
- 👑 **Owner/Admin/Member** roles với quyền hạn rõ ràng
- 📨 **Thông báo mời tham gia** tự động

### 📋 Quản lý Nhiệm vụ

- 📝 **Tạo task chi tiết** với mô tả, deadline, ưu tiên
- 🏷️ **Danh mục thông minh** để tổ chức công việc
- 👤 **Gán nhiệm vụ** cho thành viên cụ thể
- 📊 **Theo dõi trạng thái** với workflow hoàn chỉnh

### 📊 Bảng Kanban

- 🎯 **Drag & Drop** trực quan để di chuyển task
- 📈 **3 cột chính**: To Do → In Progress → Done
- 🎨 **Giao diện đẹp** với animations mượt mà
- 📱 **Responsive** trên mọi thiết bị

### 💬 Bình luận & Thảo luận

- 💭 **Bình luận task** với avatar và tên người dùng
- 📝 **Hỗ trợ Markdown** cho nội dung phong phú
- 🔔 **Thông báo real-time** cho mentions
- 📚 **Lịch sử thảo luận** đầy đủ

### 📎 File đính kèm

- 📎 **Upload nhiều loại file** (ảnh, PDF, tài liệu)
- 💾 **Lưu trữ đám mây** an toàn
- 👁️ **Xem trước file** trực tiếp
- 🔒 **Phân quyền truy cập** theo workspace

### 📊 Thống kê & Báo cáo

- 📈 **Dashboard tổng quan** với biểu đồ đẹp
- 📊 **Thống kê chi tiết** theo workspace/task
- 📅 **Lịch sử hoạt động** đầy đủ
- 📋 **Xuất báo cáo** định dạng PDF

### 🔔 Hệ thống Thông báo

- 📬 **Thông báo real-time** cho tất cả hoạt động
- 📧 **Email reminders** tự động
- 🔔 **Push notifications** trong app
- ⚙️ **Tùy chỉnh thông báo** theo sở thích

## 🛠️ Công nghệ

### 🎨 Frontend

```javascript
React 18.2.0              // UI Framework
Vite 4.3.0               // Build Tool & Dev Server
Tailwind CSS 3.3.0       // Utility-first CSS
React Router DOM 6.8.0   // Client-side Routing
Axios 1.3.0              // HTTP Client
Lucide React 0.216.0     // Beautiful Icons
Sonner 0.3.0             // Toast Notifications
React DnD 16.0.1         // Drag & Drop
Date-fns 2.30.0          // Date Utilities
```

### ⚙️ Backend

```javascript
Node.js 18.x             // Runtime Environment
Express.js 5.1.0        // Web Framework
MySQL2 3.15.3           // MySQL Client
Sequelize 6.37.7        // ORM & Database Toolkit
JWT 9.0.2              // JSON Web Tokens
bcrypt 6.0.0           // Password Hashing
Nodemailer 7.0.10      // Email Service
Node-cron 4.2.1        // Task Scheduling
Passport.js 0.7.0      // Authentication Middleware
Multer 2.0.2           // File Upload Handling
CORS 2.8.5             // Cross-origin Resource Sharing
Helmet 7.1.0           // Security Headers
```

### 🗄️ Cơ sở dữ liệu

```sql
Users           // Quản lý tài khoản
Workspaces      // Không gian làm việc
WorkspaceMembers // Thành viên workspace
Tasks           // Nhiệm vụ chính
SubTasks        // Nhiệm vụ con
Categories      // Danh mục công việc
Comments        // Bình luận
Attachments     // File đính kèm
Notifications   // Thông báo hệ thống
ActivityLogs    // Nhật ký hoạt động
```

## 🚀 Cài đặt

### 📋 Yêu cầu hệ thống

- **Node.js** >= 16.0.0
- **MySQL** >= 8.0
- **npm** hoặc **yarn**
- **Git**

### ⚡ Cài đặt nhanh

1. **Clone repository**

   ```bash
   git clone https://github.com/NgoXCuong/zentask-todo-app.git
   cd zentask-todo-app
   ```

2. **Cài đặt dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Cấu hình môi trường**

   ```bash
   # Backend
   cp .env.example .env
   # Chỉnh sửa .env với thông tin database và email

   # Frontend
   cp .env.example .env
   # Cấu hình API endpoint
   ```

4. **Cài đặt database**

   ```bash
   # Tạo database MySQL và chạy schema
   mysql -u root -p < backend/newdb.sql

   # Hoặc tạo database thủ công:
   mysql -u root -p
   CREATE DATABASE zentask;
   EXIT;
   ```

5. **Chạy ứng dụng**

   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

6. **Truy cập**
   - 🌐 **Frontend**: http://localhost:5173
   - 🚀 **Backend API**: http://localhost:3000

### 🔧 Cấu hình chi tiết

#### Database Configuration

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zentask
DB_PORT=3306
DB_DIALECT=mysql
```

#### Email Configuration (cho notifications)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### JWT Configuration

```env
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

## 👨‍💻 Tác giả

**Ngô Xuân Cường** - _My goal is to become a backend programmer._

- 📧 Email: ngocuongcm2005@gmail.com
- 🔗 LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [@NgoXCuong](https://github.com/NgoXCuong)

---

<div align="center">

**Made with ❤️ by [Ngô Xuân Cường](https://github.com/NgoXCuong)**

⭐ **Nếu project này hữu ích, hãy cho chúng tôi một ngôi sao!**

[⬆️ Về đầu trang](#-zentask---nền-tảng-quản-lý-công-việc-hiện-đại)

</div>
