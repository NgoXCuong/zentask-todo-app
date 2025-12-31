import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authAPI } from "../services/api";

// Get API base URL (includes /api)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// Google Icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export default function ZenTaskLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle OAuth success callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const oauthSuccess = urlParams.get("oauth");

    if (oauthSuccess === "success") {
      // Clear the URL parameter
      navigate("/login", { replace: true });

      // Try to authenticate the user
      handleOAuthSuccess();
    }
  }, [location.search, navigate]);

  const handleOAuthSuccess = async () => {
    setIsOAuthLoading(true);
    try {
      // Check if user is authenticated
      const result = await authAPI.checkAuth();
      if (result.ok && result.data.user) {
        toast.success("Đăng nhập bằng Google thành công!");
        navigate("/");
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("OAuth success handling error:", error);
      toast.error("Lỗi khi hoàn tất đăng nhập. Vui lòng thử lại.");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.ok) {
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.error(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-max">
        {/* Auth Card */}
        <Card className="border border-border bg-card">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Đăng nhập
              </h1>
              <p className="text-base text-muted-foreground">
                Quản lý công việc hiệu quả nâng cao năng suất
              </p>
            </div>
            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="example@gmail.com"
                            className="pl-10 text-sm rounded-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 text-sm rounded-xs"
                            {...field}
                          />
                          {showPassword ? (
                            <EyeOff
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <Eye
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                              onClick={() => setShowPassword(true)}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-primary text-sm hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full glass-effect  text-white bg-blue-500 hover:bg-blue-700 hover:scale-105 font-medium py-3 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
            </Form>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  const url = `${API_BASE}/users/auth/google`;
                  console.log("Redirecting to Google OAuth:", url);
                  window.location.href = url;
                }}
              >
                <GoogleIcon />
                <span className="font-medium">Đăng nhập bằng Google</span>
              </Button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="px-4 text-muted-foreground">hoặc</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
