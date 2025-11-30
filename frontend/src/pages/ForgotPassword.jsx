import { useState } from "react";
import { Link } from "react-router-dom";

export default function ZenTaskForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({
    text: "",
    isError: false,
    show: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError, show: true });
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showMessage("Vui lòng nhập email", true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        showMessage(
          "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
          false
        );
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
          <p className="opacity-90">Khôi phục mật khẩu của bạn</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
            Quên mật khẩu
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

          {!emailSent ? (
            <>
              {/* Form */}
              <div>
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
                  <p className="text-xs text-gray-400 mt-1.5">
                    Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                <button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? "Đang xử lý..." : "Gửi email đặt lại mật khẩu"}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-4 text-gray-400">hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Back to Login */}
              <div className="text-center text-gray-600">
                <p>
                  Nhớ mật khẩu?{" "}
                  <Link
                    to="/login"
                    className="text-indigo-500 font-semibold hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-green-600 mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-xl font-semibold">Email đã được gửi!</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
