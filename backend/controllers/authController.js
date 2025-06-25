const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Helper: Validate signup data by role
function validateSignupData(body) {
  const {
    name,
    email,
    password,
    phone,
    role,
    studentClass,
    studentParent,
    teacherSubjects,
    parentChild,
  } = body;
  if (!name || typeof name !== "string")
    return "Name is required and must be a string.";
  if (!email || typeof email !== "string")
    return "Email is required and must be a string.";
  if (!password || typeof password !== "string")
    return "Password is required and must be a string.";
  if (!phone || typeof phone !== "string")
    return "Phone is required and must be a string.";
  if (!role || !["student", "teacher", "parent", "admin"].includes(role))
    return "Role is required and must be one of student, teacher, parent, admin.";

  if (role === "student") {
    if (typeof studentClass !== "number")
      return "studentClass is required and must be a number for students.";
    // studentParent is optional, set by admin
  }
  if (role === "teacher") {
    if (!Array.isArray(teacherSubjects))
      return "teacherSubjects must be an array for teachers.";
    if (!teacherSubjects.every((subj) => typeof subj === "string"))
      return "Each teacherSubject must be a string.";
  }
  if (role === "parent") {
    // parentChild is optional, set by admin
  }
  return null;
}

// Signup controller
exports.signup = async (req, res) => {
  try {
    const error = validateSignupData(req.body);
    if (error) return res.status(400).json({ error });

    const {
      name,
      email,
      password,
      phone,
      role,
      studentClass,
      studentParent,
      teacherSubjects,
      parentChild,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "Email already registered." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = { name, email, password: hashedPassword, phone, role };
    if (role === "student") {
      userData.studentClass = studentClass;
      if (studentParent) userData.studentParent = studentParent;
    }
    if (role === "teacher") {
      userData.teacherSubjects = teacherSubjects;
    }
    if (role === "parent") {
      if (parentChild) userData.parentChild = parentChild;
    }

    const user = new User(userData);
    await user.save();
    // Do not return password
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ user: userObj });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
