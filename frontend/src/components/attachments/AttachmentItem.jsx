import { FileText, Image, File, Download, Trash2, Loader2 } from "lucide-react";
import { attachmentsAPI } from "../../services/api";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const AttachmentItem = ({
  attachment,
  taskId,
  onDelete,
  canDelete = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    if (!confirm("Bạn có chắc muốn xóa file đính kèm này?")) return;

    setIsDeleting(true);
    try {
      const result = await attachmentsAPI.delete(taskId, attachment.id);
      if (result.ok) {
        onDelete(attachment.id);
      } else {
        toast.error("Không thể xóa file đính kèm");
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Lỗi khi xóa file đính kèm");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    // In a real app, this would download the file from the server
    // For now, we'll just open it in a new tab
    window.open(attachment.file_path, "_blank");
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) {
      return <Image className="w-5 h-5 text-green-600" />;
    } else if (fileType?.includes("pdf")) {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else {
      return <File className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(attachment.file_type)}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">
                {attachment.file_name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatFileSize(attachment.file_size)}</span>
                <span>•</span>
                <span>{formatDate(attachment.created_at)}</span>
                {attachment.User && (
                  <>
                    <span>•</span>
                    <span>{attachment.User.full_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Tải xuống"
            >
              <Download className="w-4 h-4" />
            </Button>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:bg-destructive/10"
                title="Xóa file"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentItem;
