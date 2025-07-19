const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Türkiye saatine göre tarih belirleme
const getLocalDateString = (date) => {
  return new Date(date)
    .toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })
    .split(".")
    .reverse()
    .join("-");
};

// Türkiye saatine göre gün aralığını (UTC cinsinden) döner
const getTurkishDayRangeInUTC = (date = new Date()) => {
  const istOffset = 3 * 60 * 60 * 1000;
  const turkishNow = new Date(date.getTime() + istOffset);

  // 00:00–03:59 arasıysa bir önceki güne kaydır
  if (turkishNow.getHours() < 4) {
    turkishNow.setDate(turkishNow.getDate() - 1);
  }

  const year = turkishNow.getFullYear();
  const month = turkishNow.getMonth();
  const day = turkishNow.getDate();

  const startOfDay = new Date(Date.UTC(year, month, day, 1, 0, 0)); // 04:00 TR
  const endOfDay = new Date(Date.UTC(year, month, day + 1, 0, 59, 59)); // 03:59 TR

  return { startOfDay, endOfDay };
};

// Görev kaydetme
router.post("/save", async (req, res) => {
  const data = req.body; // [{ task, value }]
  const { startOfDay, endOfDay } = getTurkishDayRangeInUTC();

  try {
    const ops = data.map(({ task, value }) => ({
      updateOne: {
        filter: {
          task,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
        update: { $set: { value } },
        upsert: true,
      },
    }));

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

// Türkiye saatine göre günlük gruplama
router.get("/by-day", async (req, res) => {
  try {
    const allTasks = await Task.find();
    const grouped = {};

    allTasks.forEach((item) => {
      const { startOfDay } = getTurkishDayRangeInUTC(item.createdAt);
      const dateKey = getLocalDateString(startOfDay); // Günün başı Türkiye saatine göre

      if (!grouped[dateKey]) grouped[dateKey] = [];

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

// Haftalık toplamlar (TR saatine göre)
router.get("/weekly", async (req, res) => {
  try {
    const now = new Date();
    const summary = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const { startOfDay, endOfDay } = getTurkishDayRangeInUTC(date);
      const dayKey = getLocalDateString(startOfDay);

      const dailyTasks = await Task.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      summary[dayKey] = {
        total: dailyTasks.reduce((sum, t) => sum + t.value, 0),
        tasks: dailyTasks.map((t) => ({
          task: t.task,
          value: t.value,
        })),
      };
    }

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
