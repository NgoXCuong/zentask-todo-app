import { useRef } from "react";

export default function TaskControls({
  filter,
  setFilter,
  keyword,
  setKeyword,
  sortBy,
  setSortBy,
  order,
  setOrder,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setPage,
}) {
  const debounceRef = useRef(null);

  const handleSearch = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setKeyword(val);
      setPage(1);
    }, 500);
  };

  return (
    <div className="space-y-4 mb-5">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", "pending", "inprogress", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === s
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === ""
                ? "Tất cả"
                : s === "pending"
                ? "Chờ"
                : s === "inprogress"
                ? "Đang làm"
                : "Xong"}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sắp xếp:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="title">Tiêu đề</option>
            <option value="due_date">Hạn hoàn thành</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="DESC">Giảm dần</option>
            <option value="ASC">Tăng dần</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Từ ngày:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Đến ngày:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        {(sortBy !== "created_at" ||
          order !== "DESC" ||
          startDate ||
          endDate) && (
          <button
            onClick={() => {
              setSortBy("created_at");
              setOrder("DESC");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
