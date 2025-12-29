const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

// Generic API call function
async function apiCall(endpoint, method = "GET", body = null, isRetry = false) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    let res = await fetch(API_BASE + endpoint, options);

    // Handle 401 Unauthorized
    if (res.status === 401) {
      if (!isRetry && endpoint !== "/users/refresh-token") {
        console.log("Token hết hạn. Đang thử làm mới");

        const refreshRes = await fetch(API_BASE + "/users/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          console.log("Làm mới thành công! Đang gọi lại API cũ...");
          return apiCall(endpoint, method, body, true);
        }
      }
      console.warn("Phiên đăng nhập hết hạn. Đang đăng xuất..!");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return { ok: false, error: "Anouthorized" };
    }

    const data = await res.json();
    return { data, ok: res.ok };
  } catch (error) {
    console.error("API Error:", error);
    return { ok: false, error: "Network error" };
  }
}

// ==================== AUTH API ====================

export const authAPI = {
  login: async (email, password) => {
    return await apiCall("/users/login", "POST", { email, password });
  },

  register: async (full_name, email, password) => {
    const { data, ok } = await apiCall("/users/register", "POST", {
      full_name,
      email,
      password,
    });
    return { data, ok };
  },

  logout: async () => {
    await apiCall("/users/logout", "POST");
    localStorage.removeItem("user");
  },

  checkAuth: async () => {
    return await apiCall("/users/auth");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },

  updateProfile: async (profileData) => {
    return await apiCall("/users/profile", "PUT", profileData);
  },

  uploadAvatar: async (formData) => {
    const options = {
      method: "POST",
      credentials: "include",
      body: formData,
    };

    try {
      const res = await fetch(API_BASE + "/users/upload-avatar", options);
      const data = await res.json();
      return { data, ok: res.ok };
    } catch (error) {
      console.error("Upload Avatar Error:", error);
      return { ok: false, error: "Network error" };
    }
  },
};

// ==================== TASKS API ====================
export const tasksAPI = {
  // Get all tasks with filters
  getAll: async ({
    page = 1,
    limit = 5,
    status = "",
    keyword = "",
    sort_by = "created_at",
    order = "DESC",
    priority = "",
    start_date = "",
    end_date = "",
    workspace_id = "",
  } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
      keyword,
      sort_by,
      order,
      priority,
      start_date,
      end_date,
      workspace_id,
    });
    return await apiCall(`/tasks?${params}`);
  },

  // Get single task
  getById: async (id) => {
    return await apiCall(`/tasks/${id}`);
  },

  // Create new task
  create: async (taskData) => {
    return await apiCall("/tasks", "POST", taskData);
  },

  // Update task
  update: async (id, taskData) => {
    return await apiCall(`/tasks/${id}`, "PUT", taskData);
  },

  // Delete task
  delete: async (id) => {
    return await apiCall(`/tasks/${id}`, "DELETE");
  },

  // Get stats
  getStats: async () => {
    return await apiCall("/tasks/stats");
  },

  // Sub-tasks
  getSubTasks: async (taskId) => {
    return await apiCall(`/tasks/${taskId}/sub-tasks`);
  },

  createSubTask: async (taskId, subTaskData) => {
    return await apiCall(`/tasks/${taskId}/sub-tasks`, "POST", subTaskData);
  },

  updateSubTask: async (taskId, subTaskId, subTaskData) => {
    return await apiCall(
      `/tasks/${taskId}/sub-tasks/${subTaskId}`,
      "PUT",
      subTaskData
    );
  },

  deleteSubTask: async (taskId, subTaskId) => {
    return await apiCall(`/tasks/${taskId}/sub-tasks/${subTaskId}`, "DELETE");
  },

  // Comments
  getComments: async (taskId) => {
    return await apiCall(`/tasks/${taskId}/comments`);
  },

  createComment: async (taskId, commentData) => {
    return await apiCall(`/tasks/${taskId}/comments`, "POST", commentData);
  },

  updateComment: async (taskId, commentId, commentData) => {
    return await apiCall(
      `/tasks/${taskId}/comments/${commentId}`,
      "PUT",
      commentData
    );
  },

  deleteComment: async (taskId, commentId) => {
    return await apiCall(`/tasks/${taskId}/comments/${commentId}`, "DELETE");
  },
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  // Get all categories
  getAll: async ({ page = 1, limit = 6 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return await apiCall(`/categories?${params}`);
  },

  // Create new category
  create: async (categoryData) => {
    return await apiCall("/categories", "POST", categoryData);
  },

  // Update category
  update: async (id, categoryData) => {
    return await apiCall(`/categories/${id}`, "PUT", categoryData);
  },

  // Delete category
  delete: async (id) => {
    return await apiCall(`/categories/${id}`, "DELETE");
  },
};

// ==================== WORKSPACES API ====================
export const workspacesAPI = {
  // Get user's workspaces
  getUserWorkspaces: async ({ page = 1, limit = 6 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return await apiCall(`/workspaces?${params}`);
  },

  // Create new workspace
  create: async (workspaceData) => {
    return await apiCall("/workspaces", "POST", workspaceData);
  },

  // Get workspace by ID
  getById: async (id) => {
    return await apiCall(`/workspaces/${id}`);
  },

  // Update workspace
  update: async (id, workspaceData) => {
    return await apiCall(`/workspaces/${id}`, "PUT", workspaceData);
  },

  // Delete workspace
  delete: async (id) => {
    return await apiCall(`/workspaces/${id}`, "DELETE");
  },

  // Add member to workspace
  addMember: async (workspaceId, memberData) => {
    return await apiCall(
      `/workspaces/${workspaceId}/members`,
      "POST",
      memberData
    );
  },

  // Update member role
  updateMember: async (workspaceId, memberId, memberData) => {
    return await apiCall(
      `/workspaces/${workspaceId}/members/${memberId}`,
      "PUT",
      memberData
    );
  },

  // Remove member from workspace
  removeMember: async (workspaceId, memberId) => {
    return await apiCall(
      `/workspaces/${workspaceId}/members/${memberId}`,
      "DELETE"
    );
  },

  // Accept workspace invitation
  acceptInvitation: async (workspaceId) => {
    return await apiCall(
      `/workspaces/${workspaceId}/accept-invitation`,
      "POST"
    );
  },

  // Decline workspace invitation
  declineInvitation: async (workspaceId) => {
    return await apiCall(
      `/workspaces/${workspaceId}/decline-invitation`,
      "POST"
    );
  },

  // Leave workspace
  leaveWorkspace: async (workspaceId) => {
    return await apiCall(`/workspaces/${workspaceId}/leave`, "POST");
  },
};

// ==================== NOTIFICATIONS API ====================
export const notificationsAPI = {
  // Get user's notifications
  getUserNotifications: async ({ page = 1, limit = 10, is_read = "" } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(is_read !== "" && { is_read }),
    });
    return await apiCall(`/notifications?${params}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return await apiCall("/notifications/unread-count");
  },

  // Mark as read
  markAsRead: async (id) => {
    return await apiCall(`/notifications/${id}/read`, "PUT");
  },

  // Mark all as read
  markAllAsRead: async () => {
    return await apiCall("/notifications/mark-all-read", "PUT");
  },

  // Create notification
  create: async (notificationData) => {
    return await apiCall("/notifications", "POST", notificationData);
  },

  // Delete notification
  delete: async (id) => {
    return await apiCall(`/notifications/${id}`, "DELETE");
  },
};

// ==================== ATTACHMENTS API ====================
export const attachmentsAPI = {
  // Get attachments by task
  getByTask: async (taskId) => {
    return await apiCall(`/tasks/${taskId}/attachments`);
  },

  // Upload attachment
  upload: async (taskId, attachmentData) => {
    return await apiCall(
      `/tasks/${taskId}/attachments`,
      "POST",
      attachmentData
    );
  },

  // Get attachment by ID
  getById: async (taskId, attachmentId) => {
    return await apiCall(`/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // Delete attachment
  delete: async (taskId, attachmentId) => {
    return await apiCall(
      `/tasks/${taskId}/attachments/${attachmentId}`,
      "DELETE"
    );
  },
};

// ==================== ACTIVITY LOGS API ====================
export const activityLogsAPI = {
  // Get activity logs
  getAll: async ({
    page = 1,
    limit = 20,
    workspace_id = "",
    task_id = "",
    action = "",
  } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(workspace_id && { workspace_id }),
      ...(task_id && { task_id }),
      ...(action && { action }),
    });
    return await apiCall(`/activity-logs?${params}`);
  },

  // Get activity stats
  getStats: async ({ workspace_id = "", task_id = "" } = {}) => {
    const params = new URLSearchParams({
      ...(workspace_id && { workspace_id }),
      ...(task_id && { task_id }),
    });
    return await apiCall(`/activity-logs/stats?${params}`);
  },

  // Create activity log
  create: async (logData) => {
    return await apiCall("/activity-logs", "POST", logData);
  },
};

// ==================== EXPORT DEFAULT ====================
export default {
  auth: authAPI,
  tasks: tasksAPI,
  categories: categoriesAPI,
  workspaces: workspacesAPI,
  notifications: notificationsAPI,
  attachments: attachmentsAPI,
  activityLogs: activityLogsAPI,
};
