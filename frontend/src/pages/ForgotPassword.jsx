import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
import { Mail } from "lucide-react";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ZenTaskForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success(
          "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
        );
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quên mật khẩu Zen Task
          </h1>
          <p className="text-lg text-gray-600">
            Khôi phục mật khẩu tài khoản của bạn
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8">
            {!emailSent ? (
              <>
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
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                              <Input
                                type="email"
                                placeholder="example@gmail.com"
                                className="pl-10 text-sm rounded-none"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500 mt-1">
                            Nhập email đã đăng ký để nhận liên kết đặt lại mật
                            khẩu
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full glass-effect rounded-sm text-white font-medium py-3 mt-2"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Đang xử lý..."
                        : "Gửi email đặt lại mật khẩu"}
                    </Button>
                  </form>
                </Form>

                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-4 text-gray-400">hoặc</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <p className="mt-2 text-center text-sm text-gray-600">
                  Nhớ mật khẩu?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
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
                  className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-sm font-semibold hover:bg-indigo-600 transition"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
