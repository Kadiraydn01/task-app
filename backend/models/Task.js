// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    task: String,
    value: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
