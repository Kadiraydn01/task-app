// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const mongoose = require("mongoose");

const formatDate = (date) => {
  return date.toISOString().split("T")[0]; // "2025-07-10"
};

router.post("/save", async (req, res) => {
  const data = req.body; // [{ task, value }]

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0]; // "2025-07-10"

  try {
    const ops = data.map(({ task, value }) => {
      const startOfDay = new Date(todayDateString + "T00:00:00.000Z");
      const endOfDay = new Date(todayDateString + "T23:59:59.999Z");

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

// GET: Tüm görevleri ve değerlerini getir
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    res.status(500).json({ error: "Veriler alınamadı" });
  }
});

router.get("/by-day", async (req, res) => {
  try {
    const allTasks = await Task.find();

    const grouped = {};

    allTasks.forEach((item) => {
      const dateKey = item.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
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

// GET: Son 7 güne ait toplamlar
router.get("/weekly", async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  try {
    const tasks = await Task.find({
      createdAt: {
        $gte: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    const summary = {};

    tasks.forEach((task) => {
      const dateKey = task.createdAt.toISOString().split("T")[0];

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
