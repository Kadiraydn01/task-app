import React, { useState, useMemo } from "react";
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
];

export default function RecordPage() {
  const [data, setData] = useState(
    tasks.map(() => ({ value: "", checked: false }))
  );
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const handleBack = () => navigate("/");

  const handleCheck = (index) => {
    setData((prev) => {
      const updated = [...prev];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  };

  const handleValueChange = (index, newValue) => {
    setData((prev) => {
      const updated = [...prev];
      updated[index].value = newValue;
      return updated;
    });
  };

  const handleSave = async () => {
    const toSend = tasks
      .map((task, index) => ({
        task,
        value: Number(data[index].value),
        checked: data[index].checked,
      }))
      .filter((item) => item.checked && !isNaN(item.value));

    if (toSend.length === 0) {
      alert("En az bir görev işaretlenmeli ve değeri girilmeli.");
      return;
    }

    try {
      const res = await fetch(
        "https://task-app-e1t6.onrender.com/api/tasks/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toSend),
        }
      );
      const result = await res.json();
      alert(result.message || "Kayıt tamamlandı.");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      alert("Kayıt sırasında hata oluştu.");
    }
  };

  const toplam = useMemo(() => {
    return data.reduce((acc, item) => {
      if (item.checked && !isNaN(item.value) && item.value !== "") {
        return acc + Number(item.value);
      }
      return acc;
    }, 0);
  }, [data]);

  return (
    <div
      className="flex flex-col min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100"
      style={{
        backgroundImage: "url('/okyanus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={handleSave}
          className="px-8 py-3 text-lg font-semibold text-white transition duration-300 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl active:scale-95"
          type="button"
        >
          Kaydet
        </button>
        <button
          onClick={handleBack}
          className="px-8 py-3 text-lg font-semibold text-gray-700 transition duration-300 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 hover:shadow-xl active:scale-95"
          type="button"
        >
          Geri Dön
        </button>
      </div>

      <h1 className="mx-6 mb-8 text-3xl font-bold tracking-tight text-center select-none text-cyan-600">
        Tarih: {today}
      </h1>

      <div className="grid grid-cols-1 gap-6 mx-4 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-9">
        {tasks.map((task, index) => {
          const isChecked = data[index].checked;
          return (
            <div
              key={index}
              onClick={() => handleCheck(index)}
              className={`cursor-pointer rounded-2xl border transition-shadow duration-300 shadow-md flex flex-col items-center py-4 px-2 gap-3 text-center
                ${
                  isChecked
                    ? "bg-green-100 border-green-400 shadow-green-300"
                    : "bg-white border-gray-300 hover:shadow-lg hover:border-blue-300"
                }`}
              title={task}
            >
              <h2
                className={`text-sm font-semibold select-none ${
                  isChecked ? "text-green-800" : "text-gray-900"
                }`}
              >
                {task}
              </h2>

              <input
                type="number"
                value={data[index].value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={`w-16 text-center rounded-md border px-2 py-1 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                ${
                  isChecked
                    ? "bg-green-100 border-green-400 focus:border-green-500"
                    : "bg-white border-gray-300"
                }`}
              />

              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheck(index)}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 accent-green-600 hover:accent-green-800"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <div className="px-6 py-4 text-2xl font-bold text-blue-700 border border-blue-300 shadow-lg rounded-xl bg-white/80 backdrop-blur">
          Toplam: {toplam}
        </div>
      </div>
    </div>
  );
}
