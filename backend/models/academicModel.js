const mongoose = require("mongoose");

const academicSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedVideos: {
      type: Number,
      default: 0,
    },
    watchedVideos: {
      type: Number,
      default: 0,
    },
    grades: [
      {
        subject: { type: String, required: true },
        grade: { type: String, required: true },
      },
    ],
    subjectsEnrolled: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Academic", academicSchema);
