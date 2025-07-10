import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-100"
      style={{
        backgroundImage: "url('/bebi.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-6 bg-orange-400 shadow-md cursor-not-allowed hover:bg-orange-200 rounded-3xl">
        <h1 className="text-4xl font-bold text-center">Hoş Geldin Ayşo!</h1>
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/record")}
          className="px-8 py-4 text-xl text-white bg-blue-600 rounded-3xl hover:bg-blue-700"
        >
          Günlük Kayıt Girişi
        </button>
        <button
          onClick={() => navigate("/statistics")}
          className="px-8 py-4 text-xl text-white bg-green-600 rounded-3xl hover:bg-green-700"
        >
          İstatistikleri Gör
        </button>
      </div>
    </div>
  );
}
