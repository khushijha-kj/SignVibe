const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ error: "Email is required and must be a string." });
    }
    if (!password || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Password is required and must be a string." });
    }
    if (
      !role ||
      typeof role !== "string" ||
      !["student", "teacher", "parent", "admin"].includes(role)
    ) {
      return res.status(400).json({
        error:
          "Role is required and must be one of student, teacher, parent, admin.",
      });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid email, password, or role." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid email, password, or role." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "7d" }
    );

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Only return non-sensitive info
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ message: "Login successful", user: userObj });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Logout controller
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
};
