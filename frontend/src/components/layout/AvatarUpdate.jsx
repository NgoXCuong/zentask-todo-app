import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { User, Upload, X, Image, Trash2Icon } from "lucide-react";
import { authAPI } from "../../services/api";

const AvatarUpdate = ({ onClose }) => {
  const { user, updateProfile, updateUserData } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Update local state when user context changes
  useEffect(() => {
    setAvatarUrl(user?.avatar_url || "");
  }, [user?.avatar_url]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatarUrl.trim()) {
      toast.error("Vui lòng nhập URL ảnh đại diện!");
      return;
    }

    setLoading(true);
    const result = await updateProfile({ avatar_url: avatarUrl.trim() });

    if (result.ok) {
      toast.success("Cập nhật ảnh đại diện thành công!");
      onClose && onClose();
    } else {
      toast.error(result.message || "Cập nhật thất bại!");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)!");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 5MB!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await authAPI.uploadAvatar(formData);

      if (result.ok && result.data?.user) {
        // Update AuthContext with the new user data directly
        updateUserData(result.data.user);
        toast.success("Upload ảnh đại diện thành công!");
        onClose && onClose();
      } else {
        toast.error(result.data?.message || "Upload thất bại!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi khi upload ảnh!");
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    setLoading(true);
    const result = await updateProfile({ avatar_url: null });

    if (result.ok) {
      setAvatarUrl("");
      toast.success("Đã xóa ảnh đại diện!");
      onClose && onClose();
    } else {
      toast.error(result.message || "Xóa ảnh đại diện thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className=" space-y-4 bg-white dark:bg-gray-800">
      {/* Current Avatar Display */}
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
          {user?.avatar_url ? (
            <img
              src={
                user.avatar_url.startsWith("http")
                  ? user.avatar_url
                  : `http://localhost:3000${user.avatar_url}`
              }
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = ""; // Clear src on error
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-muted flex items-center justify-center ${
              user?.avatar_url ? "hidden" : "flex"
            }`}
          >
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Avatar URL Input */}
      <div>
        <Label htmlFor="avatar-url" className="block text-sm font-medium mb-2">
          URL ảnh đại diện
        </Label>
        <Input
          id="avatar-url"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full"
        />
      </div>

      {/* File Upload (Future feature) */}
      <div>
        <Label className="block text-sm font-medium mb-2">
          Hoặc upload ảnh
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Chọn file ảnh
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          Chấp nhận: JPEG, PNG, GIF, WebP (tối đa 5MB)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {user?.avatar_url && (
          <Button
            type="button"
            variant="destructive"
            onClick={removeAvatar}
            disabled={loading}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        )}
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </div>
    </div>
  );
};

export default AvatarUpdate;
