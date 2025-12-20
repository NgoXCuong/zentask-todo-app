# Zen Task - Ứng dụng Quản lý Công việc

## Mục tiêu Dự án

Zen Task là một ứng dụng quản lý công việc toàn diện được thiết kế để giúp cá nhân và nhóm làm việc hiệu quả hơn. Dự án nhằm cung cấp một nền tảng đơn giản, trực quan để tổ chức, theo dõi và hoàn thành các nhiệm vụ hàng ngày, với khả năng hợp tác nhóm và tích hợp các tính năng thông minh như nhắc nhở tự động.

## Chức năng Chính

### Quản lý Người dùng

- Đăng ký và đăng nhập tài khoản
- Quên mật khẩu và đặt lại mật khẩu
- Xác thực JWT cho bảo mật

### Không gian Làm việc (Workspaces)

- Tạo và quản lý các không gian làm việc riêng biệt
- Mời thành viên tham gia workspace
- Phân quyền truy cập cho các thành viên

### Danh mục (Categories)

- Tổ chức công việc theo danh mục
- Tạo, chỉnh sửa và xóa danh mục
- Phân loại nhiệm vụ theo chủ đề

### Quản lý Nhiệm vụ (Tasks)

- Tạo nhiệm vụ mới với tiêu đề, mô tả, ngày đến hạn
- Phân loại ưu tiên (thấp, trung bình, cao)
- Gán nhiệm vụ cho thành viên trong workspace
- Theo dõi trạng thái nhiệm vụ (todo, in progress, done)

### Nhiệm vụ Con (Sub-tasks)

- Chia nhỏ nhiệm vụ lớn thành các bước nhỏ hơn
- Theo dõi tiến độ từng sub-task

### Bảng Kanban

- Hiển thị nhiệm vụ theo dạng bảng kéo thả
- Các cột: To Do, In Progress, Done
- Dễ dàng di chuyển nhiệm vụ giữa các trạng thái

### Bình luận và Thảo luận

- Thêm bình luận cho từng nhiệm vụ
- Thảo luận nhóm về chi tiết nhiệm vụ

### Nhắc nhở Tự động

- Gửi email nhắc nhở khi nhiệm vụ sắp đến hạn
- Cấu hình thời gian nhắc nhở

### Giao diện Người dùng

- Thiết kế responsive, thân thiện với mobile
- Chế độ sáng/tối
- Dashboard với thống kê tổng quan
- Tìm kiếm và lọc nhiệm vụ

### API RESTful

- Backend cung cấp API đầy đủ cho tất cả chức năng
- Tích hợp với frontend React
- Sử dụng MySQL làm cơ sở dữ liệu

## Công nghệ Sử dụng

### Backend

- Node.js với Express.js
- MySQL cho cơ sở dữ liệu
- JWT cho xác thực
- Nodemailer cho gửi email
- Cron jobs cho nhắc nhở

### Frontend

- React với Vite
- Tailwind CSS cho styling
- React Router cho điều hướng
- Axios cho API calls
- Context API cho quản lý trạng thái

## Cài đặt và Chạy Dự án

### Yêu cầu Hệ thống

- Node.js (phiên bản 16+)
- MySQL
- npm hoặc yarn

### Cài đặt Backend

```bash
cd backend
npm install
# Cấu hình biến môi trường trong .env
npm run dev
```

### Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

### Cấu hình Cơ sở Dữ liệu

- Tạo database MySQL
- Chạy các migration scripts (nếu có)
- Cập nhật thông tin kết nối trong backend/src/config/db.js

## Sử dụng

1. Đăng ký tài khoản mới hoặc đăng nhập
2. Tạo workspace mới hoặc tham gia workspace hiện có
3. Tạo danh mục để tổ chức công việc
4. Thêm nhiệm vụ với chi tiết và ngày đến hạn
5. Sử dụng bảng Kanban để theo dõi tiến độ
6. Thêm bình luận và hợp tác với đồng đội

## Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork dự án
2. Tạo branch cho tính năng mới
3. Commit thay đổi
4. Push lên branch
5. Tạo Pull Request

## Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub hoặc liên hệ qua email cá nhân: ngocuongcm2005@gmail.com.
