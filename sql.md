CREATE DATABASE IF NOT EXISTS todo_zentask;
USE todo_zentask;

-- 1. Users (Giữ nguyên, thêm index cho email để login nhanh hơn)
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
full_name VARCHAR(150) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
hash_password VARCHAR(255) NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
refresh_token_hash TEXT NULL,
-- refresh_token_expires
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

-- 2. Workspaces (Team)
CREATE TABLE workspaces (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
owner_id INT NOT NULL,
description TEXT NULL, -- Thêm mô tả cho team
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Workspace Members (Quan hệ N-N)
CREATE TABLE workspace_members (
workspace_id INT NOT NULL,
user_id INT NOT NULL,
role ENUM('owner','admin','member','viewer') DEFAULT 'member', -- Thêm role admin để quản lý
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (workspace_id, user_id),
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Categories (Sửa đổi: Hỗ trợ cả Cá nhân & Team)
CREATE TABLE categories (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
color VARCHAR(20) DEFAULT '#808080', -- Default Gray

    user_id INT NOT NULL,       -- Người tạo
    workspace_id INT NULL,      -- Nếu NULL -> Cá nhân, Nếu có ID -> Của Team

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE

);

-- 5. Tasks (Sửa đổi quan trọng: Assignee vs Creator)
CREATE TABLE tasks (
id INT AUTO_INCREMENT PRIMARY KEY,

    workspace_id INT NULL,          -- NULL = Task Cá nhân
    category_id INT NULL,

    creator_id INT NOT NULL,        -- Người tạo task (user_id cũ)
    assignee_id INT NULL,           -- Người thực hiện (Mới). Nếu NULL -> Unassigned

    title VARCHAR(255) NOT NULL,
    description TEXT NULL,

    status ENUM('pending','inprogress','completed','review') DEFAULT 'pending', -- Thêm review cho team
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',

    start_date DATETIME NULL,       -- Đổi sang DATETIME để chính xác hơn nếu cần giờ
    due_date DATETIME NULL,
    reminder_at DATETIME NULL,

    completed_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,      -- Soft Delete (Rất tốt)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL

);

-- 6. Subtasks (Giữ nguyên)
CREATE TABLE sub_tasks (
id INT AUTO_INCREMENT PRIMARY KEY,
task_id INT NOT NULL,
title VARCHAR(255) NOT NULL,
is_done BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 7. Comments (Cần thiết cho Team)
CREATE TABLE comments (
id INT AUTO_INCREMENT PRIMARY KEY,
task_id INT NOT NULL,
user_id INT NOT NULL,
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Cần update khi edit comment
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
