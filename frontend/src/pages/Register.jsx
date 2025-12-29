import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent } from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { User, Mail, Lock, Eye, EyeOff, LogOut } from "lucide-react";

// Validation schema
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((val) => val === true, "Bạn phải đồng ý với điều khoản"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export default function ZenTaskRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const { data, ok } = await authAPI.register(
        values.fullName.trim(),
        values.email.trim(),
        values.password
      );

      if (ok) {
        toast.success("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        // Handle validation errors from backend
        if (data?.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((error) => {
            return `${error.msg}`;
          });
          toast.error(`Lỗi dữ liệu đầu vào:\n${errorMessages.join("\n")}`);
        } else {
          const errorMessage =
            data?.message || data?.error || "Đăng ký thất bại";
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 font-sans text-foreground">
      <div className="w-full max-w-max">
        {/* Auth Card */}
        <Card className="border border-border bg-card">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Tạo tài khoản mới
              </h1>
              <p className="text-base text-muted-foreground">
                Bắt đầu quản lý công việc hiệu quả cùng Zen Task.
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Nhập họ tên của bạn"
                            className="pl-10 text-sm rounded-xs"
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
                            className="pl-10 text-sm rounded-xs"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 text-sm rounded-xs"
                            {...field}
                          />
                          {showConfirmPassword ? (
                            <EyeOff
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                              onClick={() => setShowConfirmPassword(false)}
                            />
                          ) : (
                            <Eye
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                              onClick={() => setShowConfirmPassword(true)}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground leading-5">
                          Tôi đồng ý với{" "}
                          <a
                            href="#"
                            className="font-medium text-primary hover:underline"
                          >
                            Điều khoản dịch vụ
                          </a>{" "}
                          và{" "}
                          <a
                            href="#"
                            className="font-medium text-primary hover:underline"
                          >
                            Chính sách bảo mật
                          </a>
                          .
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full glass-effect rounded-sm text-white font-medium py-2 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
                </Button>
              </form>
            </Form>

            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="px-4 text-muted-foreground">hoặc</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
