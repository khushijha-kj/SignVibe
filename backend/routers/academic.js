const express = require("express");
const verifyToken = require("../middleware/auth");
const {
  acadStudent,
  acadTeacher,
  acadStudentById,
  teacherStudentList,
  teacherStudentAcademic,
} = require("../controllers/academicController");
const router = express.Router();

// Protect all academic routes with token verification
router.use(verifyToken);

// Protected routes
router.get("/student", acadStudent);
router.post("/teacher", acadTeacher);
router.get("/student/:id", acadStudentById);

// Teacher-specific routes
router.get("/teacher/students", teacherStudentList);
router.get("/teacher/student/:id", teacherStudentAcademic);

module.exports = router;
