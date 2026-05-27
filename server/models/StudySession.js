const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest co-studiers
    },
    nickname: {
      type: String,
      required: true,
      default: "Guest Scholar",
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    category: {
      type: String,
      required: true,
      default: "General",
      enum: ["General", "Coding", "Mathematics", "Writing", "Reading", "Languages"],
    },
    roomName: {
      type: String,
      required: true,
      default: "Silent Study Room",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudySession", studySessionSchema);