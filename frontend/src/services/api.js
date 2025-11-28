const API_BASE = "http://localhost:3000/api";

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
    const { data, ok } = await apiCall("/users/login", "POST", {
      email,
      password,
    });
    if (ok) {
      // localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return { data, ok };
  },

  register: async (full_name, email, password) => {
    const { data, ok } = await apiCall("/users/register", "POST", {
      full_name,
      email,
      password,
    });
    // if (ok) {
    //   localStorage.setItem("token", data.token);
    //   localStorage.setItem("user", JSON.stringify(data.user));
    // }
    return { data, ok };
  },

  logout: async () => {
    await apiCall("/users/logout", "POST");
    localStorage.removeItem("user");
    // localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    // return !!(localStorage.getItem("user") && localStorage.getItem("token"));
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
  } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
      keyword,
      sort_by,
      order,
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
};

// ==================== EXPORT DEFAULT ====================

export default {
  auth: authAPI,
  tasks: tasksAPI,
};
