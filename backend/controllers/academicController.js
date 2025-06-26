const Academic = require("../models/academicModel");
const User = require("../models/userModel");

// GET /student - Get all academic records for students (admin/teacher only)
exports.acadStudent = async (req, res) => {
  try {
    // Only allow admin or teacher
    if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied." });
    }
    const academics = await Academic.find().populate("student", "name email");
    res.status(200).json({ academics });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// POST /teacher - Assign/update academic record for a student (teacher only)
exports.acadTeacher = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Access denied." });
    }
    const { student, assignedVideos, watchedVideos, grades, subjectsEnrolled } =
      req.body;
    if (!student || typeof student !== "string") {
      return res
        .status(400)
        .json({ error: "student (ObjectId as string) is required." });
    }
    // Validate numbers
    if (assignedVideos !== undefined && typeof assignedVideos !== "number") {
      return res
        .status(400)
        .json({ error: "assignedVideos must be a number." });
    }
    if (watchedVideos !== undefined && typeof watchedVideos !== "number") {
      return res.status(400).json({ error: "watchedVideos must be a number." });
    }
    // Validate grades
    if (
      grades &&
      (!Array.isArray(grades) ||
        !grades.every(
          (g) =>
            g && typeof g.subject === "string" && typeof g.grade === "string"
        ))
    ) {
      return res.status(400).json({
        error:
          "grades must be an array of {subject, grade} objects with strings.",
      });
    }
    // Validate subjectsEnrolled
    if (
      subjectsEnrolled &&
      (!Array.isArray(subjectsEnrolled) ||
        !subjectsEnrolled.every((s) => typeof s === "string"))
    ) {
      return res
        .status(400)
        .json({ error: "subjectsEnrolled must be an array of strings." });
    }
    // Check if student exists
    const studentUser = await User.findById(student);
    if (!studentUser || studentUser.role !== "student") {
      return res.status(404).json({ error: "Student not found." });
    }
    // Upsert academic record
    const academic = await Academic.findOneAndUpdate(
      { student },
      {
        $set: {
          ...(assignedVideos !== undefined && { assignedVideos }),
          ...(watchedVideos !== undefined && { watchedVideos }),
          ...(grades && { grades }),
          ...(subjectsEnrolled && { subjectsEnrolled }),
        },
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ academic });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /student/:id - Get academic record for a specific student (self, teacher, or admin)
exports.acadStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "Student id is required as string." });
    }
    // Only allow: self (student), teacher, or admin
    if (
      !req.user ||
      !(
        req.user.role === "admin" ||
        req.user.role === "teacher" ||
        (req.user.role === "student" && req.user.id === id)
      )
    ) {
      return res.status(403).json({ error: "Access denied." });
    }
    const academic = await Academic.findOne({ student: id }).populate(
      "student",
      "name email"
    );
    if (!academic) {
      return res.status(404).json({ error: "Academic record not found." });
    }
    res.status(200).json({ academic });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /teacher/students - Teacher views list of students
exports.teacherStudentList = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Access denied." });
    }
    // Find all students
    const students = await User.find({ role: "student" }).select(
      "_id name email"
    );
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /teacher/student/:id - Teacher views academic details of a student
exports.teacherStudentAcademic = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ error: "Access denied." });
    }
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "Student id is required as string." });
    }
    // Check if student exists
    const studentUser = await User.findById(id);
    if (!studentUser || studentUser.role !== "student") {
      return res.status(404).json({ error: "Student not found." });
    }
    // Get academic details
    const academic = await Academic.findOne({ student: id }).populate(
      "student",
      "name email"
    );
    if (!academic) {
      return res.status(404).json({ error: "Academic record not found." });
    }
    res.status(200).json({ academic });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
