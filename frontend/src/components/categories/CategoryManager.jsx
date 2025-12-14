import { useState, useEffect } from "react";
import { categoriesAPI } from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Edit2, Trash2, Tag, X } from "lucide-react";

export default function CategoryManager({ trigger }) {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#FF5733",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    console.log("Loading categories...");
    const { data, ok } = await categoriesAPI.getAll();
    console.log("Categories loaded:", { data, ok });
    if (ok && data && Array.isArray(data.data)) {
      setCategories(data.data);
    } else {
      setCategories([]);
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
      alert("Đã thêm danh mục thành công!");
    } else {
      alert(
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Tag className="w-4 h-4 mr-2" />
            Quản lý danh mục
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Quản lý danh mục
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thêm danh mục mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label className="block text-sm font-medium mb-2">
                    Màu sắc
                  </Label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color
                            ? "border-primary"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setNewCategory({ ...newCategory, color })
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={createCategory}
                disabled={loading || !newCategory.name.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </CardContent>
          </Card>

          {/* Categories list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh sách danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
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
                        <div className="flex gap-1">
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
                {categories.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Chưa có danh mục nào
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
