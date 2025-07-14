import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const tasks = [
  "Cardiology",
  "Neurology",
  "ENT",
  "Infectious",
  "Respiratory",
  "Psychiatry",
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
  const handleBack = () => {
    navigate("/");
  };

  const today = new Date().toISOString().split("T")[0];

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

  return (
    <div
      className="min-h-screen p-2 bg-gradient-to-br from-gray-50 via-white to-gray-100"
      style={{
        backgroundImage: "url('/okyanus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="mx-6 mb-8 text-4xl font-bold tracking-tight text-center select-none text-cyan-600">
        Tarih: {today}
      </h1>

      <div className="grid grid-cols-1 gap-8 mx-4 mt-16 sm:grid-cols-2 lg:grid-cols-8">
        {tasks.map((task, index) => {
          const isChecked = data[index].checked;
          return (
            <div
              key={index}
              onClick={() => handleCheck(index)}
              className={`cursor-pointer rounded-2xl border transition-shadow duration-300 shadow-md flex flex-col items-center py-6 px-3 gap-4
                ${
                  isChecked
                    ? "bg-green-100 border-green-400 shadow-green-300"
                    : "bg-white border-gray-300 hover:shadow-lg hover:border-blue-300"
                }`}
              title={task}
            >
              <h2
                className={`text-lg font-semibold select-none ${
                  isChecked ? "text-green-800" : "text-gray-900"
                }`}
              >
                {task}
              </h2>

              <input
                type="number"
                placeholder=""
                value={data[index].value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={`w-20 text-center rounded-lg border px-3 py-2 transition-colors duration-300
    focus:outline-none focus:ring-2 focus:ring-blue-500
    appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
    ${
      isChecked
        ? "bg-green-100 border-hidden focus:border-green-500"
        : "bg-white border-gray-300"
    }`}
              />

              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheck(index)}
                onClick={(e) => e.stopPropagation()}
                className="transition-colors duration-200 cursor-pointer w-7 h-7 accent-green-600 hover:accent-green-800"
                aria-label={`Mark ${task} as completed`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSave}
          className="px-12 py-4 text-xl font-semibold text-white transition duration-300 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl active:scale-95"
          type="button"
        >
          Kaydet
        </button>
        <button
          onClick={handleBack}
          className="px-12 py-4 ml-4 text-xl font-semibold text-gray-700 transition duration-300 bg-gray-200 rounded-full shadow-lg hover:bg-gray-300 hover:shadow-xl active:scale-95"
          type="button"
        >
          Geri Dön
        </button>
      </div>
    </div>
  );
}
