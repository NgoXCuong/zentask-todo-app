import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authAPI } from "../services/api";
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

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export default function ZenTaskLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

            <div className="flex items-center my-2">
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
