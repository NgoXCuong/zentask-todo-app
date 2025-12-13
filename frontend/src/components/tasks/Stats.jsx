export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-xl text-center bg-yellow-100 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-yellow-800 font-medium mb-1">
          Chưa giải quyết
        </p>
        <h2 className="text-2xl font-bold text-yellow-800">{stats.pending}</h2>
      </div>
      <div className="p-4 rounded-xl text-center bg-blue-100 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-blue-800 font-medium mb-1">Đang tiến hành</p>
        <h2 className="text-2xl font-bold text-blue-800">{stats.inprogress}</h2>
      </div>
      <div className="p-4 rounded-xl text-center bg-green-100 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-green-800 font-medium mb-1">Đã hoàn thành</p>
        <h2 className="text-2xl font-bold text-green-800">{stats.completed}</h2>
      </div>
      <div className="p-4 rounded-xl text-center bg-purple-100 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-purple-800 font-medium mb-1">Đang xem xét</p>
        <h2 className="text-2xl font-bold text-purple-800">{stats.review}</h2>
      </div>
    </div>
  );
}
