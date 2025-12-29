import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesAPI } from "../services/api";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Plus, Edit2, Trash2, Tag, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#FF5733",
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6; // Show 6 categories per page
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
  }, [page]);

  const loadCategories = async () => {
    console.log("Loading categories...");
    const { data, ok } = await categoriesAPI.getAll({ page, limit });
    console.log("Categories loaded:", { data, ok });
    if (ok && data && Array.isArray(data.data)) {
      setCategories(data.data);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } else {
      setCategories([]);
      setTotal(0);
      setTotalPages(1);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;

    setLoading(true);
    console.log("Creating category:", newCategory);
    const { ok, data } = await categoriesAPI.create(newCategory);
    console.log("API response:", { ok, data });
    if (ok) {
      setNewCategory({ name: "", color: "#FF5733" });
      loadCategories();
      toast.success("Đã thêm danh mục thành công!");
    } else {
      toast.error(
        `Không thể thêm danh mục: ${data?.message || "Lỗi không xác định"}`
      );
    }
    setLoading(false);
  };

  const updateCategory = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category || !category.name.trim()) return;

    setLoading(true);
    const { ok } = await categoriesAPI.update(id, {
      name: category.name,
      color: category.color,
    });
    if (ok) {
      setEditingId(null);
      loadCategories();
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    setLoading(true);
    const { ok } = await categoriesAPI.delete(id);
    if (ok) {
      loadCategories();
    }
    setLoading(false);
  };

  const startEdit = (id) => {
    setEditingId(id);
  };

  const updateCategoryField = (id, field, value) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colorOptions = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F033FF",
    "#FF33A6",
    "#33FFF5",
    "#F5FF33",
    "#FF8C33",
    "#8C33FF",
    "#33FF8C",
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý danh mục
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các danh mục công việc của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add new category */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm danh mục mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">
                Tên danh mục
              </Label>
              <Input
                placeholder="Nhập tên danh mục..."
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Màu sắc</Label>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color
                          ? "border-primary"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Tùy chỉnh:</Label>
                  <input
                    type="color"
                    value={
                      newCategory.color.startsWith("#") &&
                      newCategory.color.length === 7
                        ? newCategory.color
                        : "#FF5733"
                    }
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        color: e.target.value,
                      })
                    }
                    className="w-12 h-8 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    placeholder="#FF5733"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        color: e.target.value,
                      })
                    }
                    className="w-24 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={createCategory}
              disabled={loading || !newCategory.name.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm danh mục
            </Button>
          </CardContent>
        </Card>

        {/* Categories list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Danh sách danh mục ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-border rounded-xs hover:bg-accent/50 transition-colors"
                >
                  {editingId === category.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <Input
                        value={category.name}
                        onChange={(e) =>
                          updateCategoryField(
                            category.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1 flex-wrap">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border ${
                                category.color === color
                                  ? "border-primary"
                                  : "border-border"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                updateCategoryField(category.id, "color", color)
                              }
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Tùy chỉnh:</Label>
                          <input
                            type="color"
                            value={
                              category.color.startsWith("#") &&
                              category.color.length === 7
                                ? category.color
                                : "#FF5733"
                            }
                            onChange={(e) =>
                              updateCategoryField(
                                category.id,
                                "color",
                                e.target.value
                              )
                            }
                            className="w-8 h-6 rounded border border-border cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={category.color}
                            onChange={(e) =>
                              updateCategoryField(
                                category.id,
                                "color",
                                e.target.value
                              )
                            }
                            className="w-20 text-xs font-mono h-6"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => updateCategory(category.id)}
                        disabled={loading}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(category.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(category.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && total === 0 && (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có danh mục nào</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tạo danh mục đầu tiên của bạn ở bên trái
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => page > 1 && setPage(page - 1)}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          );
                        })
                        .map((pageNum, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1];
                          if (prevPage && pageNum - prevPage > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${pageNum}`}>
                                <PaginationItem>
                                  <span className="px-3 py-2">...</span>
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setPage(pageNum)}
                                    isActive={page === pageNum}
                                    className="cursor-pointer"
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => page < totalPages && setPage(page + 1)}
                          className={
                            page >= totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
