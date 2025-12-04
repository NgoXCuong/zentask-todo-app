**Ưu Tiên Cao (Nâng Cấp Lõi):**

1. Danh mục/Thẻ
2. Mức độ ưu tiên
3. Nhiệm vụ con
4. Theo dõi thời gian

# Zen Task Database Schema - Mở Rộng

## Tổng Quan

Database schema cho ứng dụng Zen Task với các tính năng mở rộng: Danh mục/Thẻ, Mức độ ưu tiên, Nhiệm vụ con, và Theo dõi thời gian.

## Bảng Hiện Tại (Cập Nhật)

### users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hash_password VARCHAR(150) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token TEXT,
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### tasks (Cập nhật với priority)

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'inprogress', 'completed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  due_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Bảng Mới

### categories

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_category_per_user (name, user_id)
);
```

### task_categories (Quan hệ nhiều-nhiều giữa tasks và categories)

```sql
CREATE TABLE task_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_task_category (task_id, category_id)
);
```

### subtasks

```sql
CREATE TABLE subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_task_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'inprogress', 'completed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  due_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

### task_dependencies (Quan hệ phụ thuộc giữa các tasks)

```sql
CREATE TABLE task_dependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL, -- Task phụ thuộc
  depends_on_task_id INT NOT NULL, -- Task mà nó phụ thuộc vào
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dependency (task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id) -- Không thể tự phụ thuộc vào chính mình
);
```

### time_entries (Theo dõi thời gian)

```sql
CREATE TABLE time_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT,
  subtask_id INT,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INT, -- Tính toán từ start_time và end_time
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL) OR
    (task_id IS NULL AND subtask_id IS NOT NULL)
  ) -- Chỉ có thể track time cho task hoặc subtask, không phải cả hai
);
```

## Indexes để Tối Ưu Hiệu Suất

```sql
-- Indexes cho tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);

-- Indexes cho categories
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Indexes cho task_categories
CREATE INDEX idx_task_categories_task_id ON task_categories(task_id);
CREATE INDEX idx_task_categories_category_id ON task_categories(category_id);

-- Indexes cho subtasks
CREATE INDEX idx_subtasks_parent_task_id ON subtasks(parent_task_id);
CREATE INDEX idx_subtasks_status ON subtasks(status);

-- Indexes cho task_dependencies
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Indexes cho time_entries
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_subtask_id ON time_entries(subtask_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, DATE(start_time));
```

## Dữ Liệu Mẫu

```sql
-- Thêm cột priority vào bảng tasks hiện tại
ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' AFTER status;

-- Tạo bảng categories
INSERT INTO categories (name, color, user_id) VALUES
('Công việc', '#3b82f6', 1),
('Cá nhân', '#10b981', 1),
('Sức khỏe', '#f59e0b', 1),
('Học tập', '#8b5cf6', 1);

-- Tạo bảng task_categories
INSERT INTO task_categories (task_id, category_id) VALUES
(1, 1), -- Task 1 thuộc category Công việc
(2, 2), -- Task 2 thuộc category Cá nhân
(3, 1), -- Task 3 thuộc category Công việc
(3, 4); -- Task 3 cũng thuộc category Học tập

-- Tạo bảng subtasks
INSERT INTO subtasks (parent_task_id, title, status, priority) VALUES
(1, 'Nghiên cứu yêu cầu', 'completed', 'high'),
(1, 'Thiết kế giao diện', 'inprogress', 'high'),
(1, 'Viết code backend', 'pending', 'medium');

-- Tạo bảng task_dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES
(2, 1), -- Task 2 phụ thuộc vào Task 1
(4, 3); -- Task 4 phụ thuộc vào Task 3

-- Tạo bảng time_entries
INSERT INTO time_entries (task_id, user_id, start_time, end_time, duration_minutes, description) VALUES
(1, 1, '2025-12-04 09:00:00', '2025-12-04 11:30:00', 150, 'Làm việc trên task đầu tiên'),
(1, 1, '2025-12-04 13:00:00', '2025-12-04 15:45:00', 165, 'Tiếp tục phát triển'),
(2, 1, '2025-12-04 16:00:00', NULL, NULL, 'Đang làm việc'); -- Timer đang chạy
```

## Triggers và Procedures

```sql
-- Trigger để tự động tính duration_minutes khi insert/update time_entries
DELIMITER //

CREATE TRIGGER calculate_duration_before_insert
BEFORE INSERT ON time_entries
FOR EACH ROW
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time);
  END IF;
END //

CREATE TRIGGER calculate_duration_before_update
BEFORE UPDATE ON time_entries
FOR EACH ROW
BEGIN
  IF NEW.end_time IS NOT NULL AND (OLD.end_time IS NULL OR NEW.end_time != OLD.end_time) THEN
    SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time);
  END IF;
END //

DELIMITER ;
```

## Views Hữu Ích

```sql
-- View tổng hợp thông tin task với categories và time tracking
CREATE VIEW task_details AS
SELECT
  t.*,
  GROUP_CONCAT(c.name SEPARATOR ', ') as category_names,
  GROUP_CONCAT(c.color SEPARATOR ', ') as category_colors,
  SUM(te.duration_minutes) as total_time_spent,
  COUNT(te.id) as time_entries_count
FROM tasks t
LEFT JOIN task_categories tc ON t.id = tc.task_id
LEFT JOIN categories c ON tc.category_id = c.id
LEFT JOIN time_entries te ON t.id = te.task_id AND te.end_time IS NOT NULL
GROUP BY t.id;

-- View thống kê năng suất theo ngày
CREATE VIEW daily_productivity AS
SELECT
  DATE(te.start_time) as date,
  te.user_id,
  SUM(te.duration_minutes) as total_minutes,
  COUNT(DISTINCT te.task_id) as tasks_worked_on,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
FROM time_entries te
LEFT JOIN tasks t ON te.task_id = t.id
WHERE te.end_time IS NOT NULL
GROUP BY DATE(te.start_time), te.user_id
ORDER BY date DESC;
```

## Lệnh Tạo Toàn Bộ Database

```sql
-- Chạy tất cả lệnh trên theo thứ tự để tạo database hoàn chỉnh
-- 1. Tạo bảng users (đã có)
-- 2. Cập nhật bảng tasks (thêm priority)
-- 3. Tạo các bảng mới
-- 4. Tạo indexes
-- 5. Thêm dữ liệu mẫu (tùy chọn)
-- 6. Tạo triggers
-- 7. Tạo views
```
