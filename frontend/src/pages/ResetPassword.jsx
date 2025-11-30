import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ZenTaskResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({
    text: "",
    isError: false,
    show: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMessage({
        text: "Token không hợp lệ hoặc đã hết hạn",
        isError: true,
        show: true,
      });
    }
  }, [searchParams]);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError, show: true });
  };

  const handleResetPassword = async () => {
    if (!password) {
      showMessage("Vui lòng nhập mật khẩu mới", true);
      return;
    }

    if (password.length < 6) {
      showMessage("Mật khẩu phải có ít nhất 6 ký tự", true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp", true);
      return;
    }

    if (!token) {
      showMessage("Token không hợp lệ", true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...", false);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showMessage(data.message || "Có lỗi xảy ra", true);
      }
    } catch (error) {
      showMessage("Không thể kết nối đến server", true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
            📝 Zen Task
          </h1>
          <p className="opacity-90">Đặt lại mật khẩu của bạn</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
            Đặt lại mật khẩu
          </h2>

          {/* Message */}
          {message.show && (
            <div
              className={`p-3 rounded-lg mb-5 text-center border ${
                message.isError
                  ? "bg-red-50 text-red-600 border-red-500"
                  : "bg-green-50 text-green-600 border-green-500"
              }`}
            >
              {message.text}
            </div>
          )}

          {token ? (
            <>
              {/* Form */}
              <div>
                <div className="mb-5">
                  <label className="block mb-2 font-semibold text-gray-600">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Mật khẩu tối thiểu 6 ký tự
                  </p>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 font-semibold text-gray-600">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-xl font-semibold">Liên kết không hợp lệ</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng
                yêu cầu đặt lại mật khẩu mới.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition"
              >
                Yêu cầu đặt lại mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
