export default function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-5">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-4 py-2 rounded-lg ${
            page === i + 1 ? "bg-indigo-500 text-white" : "bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
