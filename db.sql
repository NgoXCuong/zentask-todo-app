-- Khởi tạo Database
CREATE DATABASE todo_zentask;
USE todo_zentask;

ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255) NULL,
ADD COLUMN password_reset_expires DATETIME NULL;

INSERT INTO users (full_name, email, hashed_password)
VALUES ('Nguyen Van A', 'a@gmail.com', '$2a$10$samplehashedpassword');
---
-- =======================
-- 1. Bảng USERS (Người dùng)
-- =======================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, 
    hashed_password VARCHAR(255) NOT NULL, -- Luôn lưu mật khẩu đã hash
    
    is_active BOOLEAN DEFAULT TRUE, -- Dễ dàng vô hiệu hóa/kích hoạt tài khoản
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


---
-- =======================
-- 2. Bảng TASKS (Công việc)
-- =======================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Khóa ngoại liên kết người tạo Task
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Sử dụng INT để dễ dàng mở rộng trạng thái (ví dụ: 1=Pending, 2=Completed, 3=InProgress)
    status_id INT NOT NULL DEFAULT 1, 
    
    -- Sử dụng INT để dễ dàng mở rộng mức ưu tiên (ví dụ: 1=Low, 2=Normal, 3=High)
    priority_id INT NOT NULL DEFAULT 2, 
    
    due_date DATE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Định nghĩa Khóa ngoại
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


