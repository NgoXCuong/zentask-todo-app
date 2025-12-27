import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Paperclip, Upload, Loader2, X } from "lucide-react";
import { attachmentsAPI } from "../../services/api";
import AttachmentItem from "./AttachmentItem";

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
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={loadAttachments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            File đính kèm ({attachments.length})
          </h3>
        </div>

        {canUpload && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">
              Upload file mới
            </h4>
            <button
              onClick={() => setShowUploadForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn file
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên file
                </label>
                <input
                  type="text"
                  value={uploadForm.file_name}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên file"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại file
                </label>
                <input
                  type="text"
                  value={uploadForm.file_type}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: image/png"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường dẫn file
              </label>
              <input
                type="url"
                value={uploadForm.file_path}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    file_path: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL của file đã upload"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{uploading ? "Đang upload..." : "Upload"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có file đính kèm nào</p>
          </div>
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
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-600 mt-2">
              Đang tải file đính kèm...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentList;
