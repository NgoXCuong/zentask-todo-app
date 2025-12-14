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
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    };

    try {
      const res = await fetch(API_BASE + "/users/login", options);
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return { data, ok: true };
      } else {
        // For login failures, don't redirect - just return the error
        return { data, ok: false };
      }
    } catch (error) {
      console.error("Login API Error:", error);
      return { ok: false, error: "Network error" };
    }
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
  getAll: async () => {
    return await apiCall("/categories");
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

// ==================== EXPORT DEFAULT ====================
export default {
  auth: authAPI,
  tasks: tasksAPI,
  categories: categoriesAPI,
};
