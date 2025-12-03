export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="p-4 rounded-xl text-center bg-chart-3/10 border border-chart-3/20 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-chart-3 font-medium mb-1">Pending</p>
        <h2 className="text-2xl font-bold text-chart-3">{stats.pending}</h2>
      </div>
      <div className="p-4 rounded-xl text-center bg-chart-2/10 border border-chart-2/20 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-chart-2 font-medium mb-1">In Progress</p>
        <h2 className="text-2xl font-bold text-chart-2">{stats.inprogress}</h2>
      </div>
      <div className="p-4 rounded-xl text-center bg-chart-1/10 border border-chart-1/20 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-chart-1 font-medium mb-1">Completed</p>
        <h2 className="text-2xl font-bold text-chart-1">{stats.completed}</h2>
      </div>
    </div>
  );
}
