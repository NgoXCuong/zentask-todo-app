import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ZenTaskRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({
    text: "",
    isError: false,
    show: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError, show: true });
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      showMessage("Vui lòng điền đầy đủ thông tin", true);
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

    setIsLoading(true);
    const { ok, message } = await register(
      fullName.trim(),
      email.trim(),
      password
    );
    setIsLoading(false);

    if (ok) {
      showMessage("Đăng ký thành công!", false);
      setTimeout(() => navigate("/"), 1000);
    } else {
      showMessage(message, true);
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
          <p className="opacity-90">
            Tạo tài khoản để bắt đầu quản lý công việc
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
            Đăng ký tài khoản
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

          {/* Form */}
          <div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-600">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-600">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tạo mật khẩu"
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
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-3.5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Switch Auth */}
          <div className="text-center text-gray-600">
            <p>
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-indigo-500 font-semibold hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
