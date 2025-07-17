import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const tasks = [
  "Cardiology",
  "Neurology",
  "ENT",
  "Anatomy",
  "Epidemiology",
  "Pharmacology",
  "Ethics",
  "Genetics",
  "Genitourinary",
  "Orthopaedics",
  "Palliative",
  "Infectious",
  "Respiratory",
  "Psychiatry",
  "Vascular",
  "Rheumatology",
  "Nephrology",
  "Urology",
  "Dermatology",
  "OBGYN",
  "Gastroenterology",
  "General Surgery",
  "Paediatrics",
  "Endocrinology",
  "Haematology",
  "Emergency",
  "Ophthalmology",
];

export default function StatisticsPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleBack = () => navigate("/");

  useEffect(() => {
    fetch("https://task-app-e1t6.onrender.com/api/tasks/by-day")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Yükleniyor...</p>
      </div>
    );
  }

  const sortedDates = Object.keys(data).sort((a, b) => (a < b ? 1 : -1)); // Yeni tarih üstte

  return (
    <div
      className="min-h-screen p-6 overflow-auto bg-gray-100"
      style={{
        backgroundImage: "url('/love.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="mb-6 text-3xl font-bold text-center text-white drop-shadow-lg">
        Günlük İstatistikler
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleBack}
          className="px-12 py-4 text-xl font-semibold text-gray-700 transition duration-300 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 hover:shadow-xl active:scale-95"
          type="button"
        >
          Geri Dön
        </button>
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-600">Henüz kayıt yok.</p>
      ) : (
        <>
          <div className="max-w-full overflow-auto">
            <table className="min-w-full bg-white border border-collapse border-gray-300 rounded shadow table-auto">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 p-2 text-left bg-white border border-gray-300">
                    Tarih
                  </th>
                  {tasks.map((task) => (
                    <th
                      key={task}
                      className="sticky top-0 z-10 p-2 text-center bg-white border border-gray-300"
                    >
                      {task}
                    </th>
                  ))}
                  <th className="sticky top-0 z-10 p-2 text-center bg-white border border-gray-300">
                    Günlük Toplam
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((date) => {
                  const dailyValues = data[date] || [];
                  const dailyTotal = dailyValues.reduce(
                    (sum, item) => sum + (item?.value || 0),
                    0
                  );

                  return (
                    <tr key={date} className="hover:bg-gray-100">
                      <td className="sticky left-0 z-10 p-2 font-semibold bg-white border border-gray-300 shadow-md">
                        {date}
                      </td>
                      {tasks.map((task) => {
                        const found = dailyValues.find(
                          (item) => item.task === task
                        );
                        const value = found ? found.value : 0;
                        return (
                          <td
                            key={task}
                            className="p-2 font-mono text-center border border-gray-300"
                          >
                            {value}
                          </td>
                        );
                      })}
                      <td className="p-2 font-bold text-center text-blue-800 border border-gray-300 bg-blue-50">
                        {dailyTotal}
                      </td>
                    </tr>
                  );
                })}

                {/* Toplam Satırı */}
                <tr className="font-bold bg-green-400 hover:bg-green-200">
                  <td className="sticky left-0 z-10 p-2 border-gray-300 shadow-md">
                    Toplam
                  </td>
                  {tasks.map((task) => {
                    let total = 0;
                    sortedDates.forEach((date) => {
                      const found = data[date]?.find(
                        (item) => item.task === task
                      );
                      total += found ? found.value : 0;
                    });
                    return (
                      <td
                        key={task}
                        className="p-2 font-mono text-center border border-gray-300"
                      >
                        {total}
                      </td>
                    );
                  })}
                  <td className="p-2 font-mono text-center bg-green-300 border border-gray-300">
                    {sortedDates.reduce((acc, date) => {
                      return (
                        acc +
                        (data[date]?.reduce(
                          (sum, item) => sum + (item?.value || 0),
                          0
                        ) || 0)
                      );
                    }, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Genel Toplam */}
          <p className="p-4 mt-6 text-xl font-semibold text-center text-white rounded-lg shadow-lg bg-black/60">
            Genel Toplam ={" "}
            {tasks.reduce((acc, task) => {
              return (
                acc +
                sortedDates.reduce((sum, date) => {
                  const found = data[date]?.find((item) => item.task === task);
                  return sum + (found ? found.value : 0);
                }, 0)
              );
            }, 0)}
          </p>
        </>
      )}
    </div>
  );
}
