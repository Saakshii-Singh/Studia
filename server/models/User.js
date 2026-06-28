const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    totalStudyTime: {
      type: Number,
      default: 0,
    },

    studyStreak: {
      type: Number,
      default: 0,
    },

    lastStudyDate: {
      type: Date,
    },

    dailyStudyGoal: {
      type: Number,
      default: 120,
    },

    badges: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: "",
    },

    verificationCodeExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);