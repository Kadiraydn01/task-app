const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Yardımcı fonksiyon: Türkiye saatine göre YYYY-MM-DD döndürür
const getLocalDateString = (date) => {
  return new Date(date)
    .toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
    })
    .split(".")
    .reverse()
    .join("-"); // "YYYY-MM-DD"
};

router.post("/save", async (req, res) => {
  const data = req.body; // [{ task, value }]

  const now = new Date();
  const todayDateString = getLocalDateString(now); // Türkiye saatine göre "YYYY-MM-DD"

  try {
    const ops = data.map(({ task, value }) => {
      const startOfDay = new Date(`${todayDateString}T00:00:00+03:00`);
      const endOfDay = new Date(`${todayDateString}T23:59:59+03:00`);

      return {
        updateOne: {
          filter: {
            task,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
          update: {
            $set: { value },
          },
          upsert: true,
        },
      };
    });

    await Task.bulkWrite(ops);

    res
      .status(200)
      .json({ message: "Veriler başarıyla kaydedildi veya güncellendi." });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ error: "Kayıt sırasında hata oluştu." });
  }
});

// Tüm görevleri getir
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    res.status(500).json({ error: "Veriler alınamadı" });
  }
});

// Günlük gruplama
router.get("/by-day", async (req, res) => {
  try {
    const allTasks = await Task.find();

    const grouped = {};

    allTasks.forEach((item) => {
      const dateKey = getLocalDateString(item.createdAt); // yerel tarih
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push({
        task: item.task,
        value: item.value,
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    res.status(500).json({ error: "Veriler alınamadı" });
  }
});

// Haftalık toplamlar
router.get("/weekly", async (req, res) => {
  const now = new Date();
  const todayDateString = getLocalDateString(now);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  const startDateString = getLocalDateString(sevenDaysAgo);

  try {
    const tasks = await Task.find({
      createdAt: {
        $gte: new Date(`${startDateString}T00:00:00+03:00`),
        $lte: new Date(`${todayDateString}T23:59:59+03:00`),
      },
    });

    const summary = {};

    tasks.forEach((task) => {
      const dateKey = getLocalDateString(task.createdAt); // yerel tarih

      if (!summary[dateKey]) {
        summary[dateKey] = {
          total: 0,
          tasks: [],
        };
      }

      summary[dateKey].total += task.value;
      summary[dateKey].tasks.push({
        task: task.task,
        value: task.value,
      });
    });

    res.json(summary);
  } catch (err) {
    console.error("Haftalık veri hatası:", err);
    res.status(500).json({ error: "Haftalık veriler alınamadı." });
  }
});

// Tüm görevleri sil
router.delete("/all", async (req, res) => {
  try {
    await Task.deleteMany({});
    res.status(200).json({ message: "Tüm görevler başarıyla silindi." });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ error: "Görevler silinirken hata oluştu." });
  }
});

module.exports = router;
