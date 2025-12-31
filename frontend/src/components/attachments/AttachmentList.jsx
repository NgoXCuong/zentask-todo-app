import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Paperclip, Upload, Loader2, X } from "lucide-react";
import { attachmentsAPI } from "../../services/api";
import AttachmentItem from "./AttachmentItem";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const AttachmentList = ({ taskId, canUpload = false, canDelete = false }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file_name: "",
    file_path: "",
    file_type: "",
    file_size: "",
  });

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const result = await attachmentsAPI.getByTask(taskId);
      if (result.ok) {
        setAttachments(result.data.data || []);
      } else {
        setError(result.data?.message || "Không thể tải file đính kèm");
      }
    } catch (err) {
      setError("Lỗi kết nối mạng");
      console.error("Error loading attachments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file_name || !uploadForm.file_path) {
      toast.error("Vui lòng điền đầy đủ thông tin file");
      return;
    }

    setUploading(true);
    try {
      const result = await attachmentsAPI.upload(taskId, uploadForm);
      if (result.ok) {
        setAttachments((prev) => [result.data.data, ...prev]);
        setUploadForm({
          file_name: "",
          file_path: "",
          file_type: "",
          file_size: "",
        });
        setShowUploadForm(false);
      } else {
        toast.error(result.data?.message || "Không thể upload file");
      }
    } catch (err) {
      console.error("Error uploading attachment:", err);
      toast.error("Lỗi khi upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({
        file_name: file.name,
        file_path: URL.createObjectURL(file), // In real app, this would be uploaded to server first
        file_type: file.type,
        file_size: file.size.toString(),
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadAttachments} variant="destructive">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-medium text-card-foreground">
            File đính kèm ({attachments.length})
          </h3>
        </div>

        {canUpload && (
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload file mới</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file-select">Chọn file</Label>
                <Input
                  id="file-select"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file-name">Tên file</Label>
                  <Input
                    id="file-name"
                    type="text"
                    value={uploadForm.file_name}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        file_name: e.target.value,
                      }))
                    }
                    placeholder="Tên file"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="file-type">Loại file</Label>
                  <Input
                    id="file-type"
                    type="text"
                    value={uploadForm.file_type}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        file_type: e.target.value,
                      }))
                    }
                    placeholder="Ví dụ: image/png"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file-path">Đường dẫn file</Label>
                <Input
                  id="file-path"
                  type="url"
                  value={uploadForm.file_path}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file_path: e.target.value,
                    }))
                  }
                  placeholder="URL của file đã upload"
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {uploading ? "Đang upload..." : "Upload"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 && !loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <Paperclip className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Chưa có file đính kèm nào</p>
            </CardContent>
          </Card>
        ) : (
          attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              taskId={taskId}
              onDelete={handleDelete}
              canDelete={canDelete}
            />
          ))
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">
                Đang tải file đính kèm...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttachmentList;
