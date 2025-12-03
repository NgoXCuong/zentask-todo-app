# 🚀 ZEN TASK - LỘ TRÌNH MỞ RỘNG DỰ ÁN (ROADMAP)

## Tài liệu này hướng dẫn chi tiết các bước chuyển đổi **Zen Task** từ ứng dụng "To-Do List cá nhân" sang hệ thống "Quản lý Dự án & Cộng tác (Project Management System)".

## 🟢 GIAI ĐOẠN 1: CẤU TRÚC LẠI DATABASE (PROJECT CONTAINER)

**Mục tiêu:** Nhóm các Task vào trong các "Dự án" riêng biệt thay vì gắn trực tiếp vào User.

### 1.1. Backend - Database & Models

- [ ] **Tạo Model `Project`**:
  - Columns: `id`, `name`, `description`, `owner_id` (FK -> User).
- [ ] **Sửa Model `Task`**:
  - Thêm cột `project_id` (FK -> Project, `allowNull: true` ban đầu để migrate data cũ).
- [ ] **Thiết lập quan hệ (Associations)**:
  - `User` hasMany `Project`.
  - `Project` hasMany `Task`.
- [ ] **Migration Data cũ (Quan trọng)**:
  - Viết script tự động tạo 1 dự án mặc định tên "Personal" cho mỗi user hiện có.
  - Gán tất cả Task cũ của user đó vào dự án "Personal" này.
  - Sau khi gán xong, sửa cột `project_id` thành `allowNull: false`.

### 1.2. Backend - API

- [ ] **Project CRUD**:
  - `POST /api/projects`: Tạo dự án mới.
  - `GET /api/projects`: Lấy danh sách dự án của tôi.
  - `PUT /api/projects/:id`: Đổi tên/mô tả.
  - `DELETE /api/projects/:id`: Xóa dự án (Kèm xóa mềm hoặc xóa hết task con).
- [ ] **Cập nhật Task API**:
  - `POST /api/tasks`: Bắt buộc gửi kèm `project_id`.
  - `GET /api/tasks`: Thêm filter `?project_id=...`.

### 1.3. Frontend

- [ ] Tạo Sidebar bên trái hiển thị danh sách Dự án.
- [ ] Khi bấm vào tên Dự án -> Load danh sách Task thuộc dự án đó.

---

## 🟡 GIAI ĐOẠN 2: TÍNH NĂNG CỘNG TÁC (COLLABORATION)

**Mục tiêu:** Cho phép nhiều người cùng truy cập và chỉnh sửa một dự án.

### 2.1. Backend - Database

- [ ] **Tạo Model `ProjectMember` (Bảng trung gian)**:
  - Columns: `project_id`, `user_id`, `role` (ENUM: 'admin', 'editor', 'viewer').
  - Thiết lập quan hệ N-N: `User` belongsToMany `Project` through `ProjectMember`.

### 2.2. Backend - API

- [ ] **Invite Member**:
  - `POST /api/projects/:id/invite`: Gửi email -> Tìm user -> Add vào bảng Member.
- [ ] **Manage Members**:
  - `GET /api/projects/:id/members`: Xem ai đang trong dự án.
  - `DELETE /api/projects/:id/members/:userId`: Mời ra khỏi nhóm.

### 2.3. Backend - Middleware & Security (Cực quan trọng)

- [ ] **Nâng cấp `authMiddleware` hoặc viết mới `projectMiddleware`**:
  - Logic cũ: `Task.user_id == req.user.id`.
  - Logic mới: Kiểm tra trong bảng `ProjectMember` xem `req.user.id` có thuộc `project_id` của Task đó không.
  - Phân quyền:
    - `Viewer`: Chỉ được GET.
    - `Editor`: Được POST, PUT (Task).
    - `Admin/Owner`: Được DELETE Project, Invite Member.

---

## 🟠 GIAI ĐOẠN 3: LÀM GIÀU NỘI DUNG (RICH CONTENT)

**Mục tiêu:** Task không chỉ là text, mà có thể đính kèm file và thảo luận.

### 3.1. Upload File (Attachments)

- [ ] **Cấu hình Multer**: (Đã có nền tảng, cần tinh chỉnh).
- [ ] **Tạo Model `Attachment`**:
  - Columns: `id`, `task_id`, `file_url`, `file_name`, `file_type`, `uploaded_by`.
- [ ] **API**:
  - `POST /api/tasks/:id/attachments`: Upload file.
  - `DELETE /api/attachments/:id`: Xóa file.

### 3.2. Bình luận (Comments)

- [ ] **Tạo Model `Comment`**:
  - Columns: `id`, `task_id`, `user_id`, `content` (Text), `created_at`.
- [ ] **API**:
  - `GET /api/tasks/:id/comments`: Lấy lịch sử thảo luận.
  - `POST /api/tasks/:id/comments`: Viết bình luận.

---

## 🔴 GIAI ĐOẠN 4: NÂNG CAO & TÍCH HỢP (ADVANCED)

**Mục tiêu:** Tự động hóa và báo cáo thông minh.

### 4.1. Notifications (Thông báo)

- [ ] **Tạo Model `Notification`**:
  - Columns: `user_id`, `content`, `is_read`, `type` (assigned, comment, deadline).
- [ ] **Logic**:
  - Khi A comment -> Tạo noti cho B (chủ task).
  - Khi A assign task cho B -> Tạo noti cho B.
- [ ] **API**: `GET /api/notifications` (Realtime càng tốt, hoặc Polling).

### 4.2. Cron Job & Email Reminder

- [ ] Sử dụng `node-cron` quét DB mỗi sáng.
- [ ] Gửi email cho những task `due_date` = hôm nay.

### 4.3. Dashboard Analytics

- [ ] API trả về thống kê theo Team:
  - Ai hoàn thành nhiều task nhất?
  - Tiến độ dự án (%) = (Task Done / Total Task).
- [ ] Frontend tích hợp `Chart.js` vẽ biểu đồ tròn/cột.

---
