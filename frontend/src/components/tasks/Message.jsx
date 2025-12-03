export default function Message({ message }) {
  if (!message.show) return null;

  return (
    <div
      className={`p-3 rounded-lg mb-4 text-center ${
        message.isError
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {message.text}
    </div>
  );
}
