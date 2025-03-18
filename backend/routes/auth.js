const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Faculty = require('../models/faculty'); 
const dotenv = require("dotenv");
const router = express.Router();

dotenv.config(); // Load environment variables

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password, role, faculty, department } = req.body;

  // Validate required fields (excluding faculty and department for certain roles)
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "Username, Email, Password, and Role are required." });
  }

  // Validate role
  const allowedRoles = ["Vice Chancellor", "Dean", "Head of Department", "Academic Staff", "Student", "Admin"]; // Updated role
if (!allowedRoles.includes(role)) {
  return res.status(400).json({ error: "Invalid Role Selected." });
}


  // Role-specific validation
  if (role === 'Dean') {
    // For dean role, only faculty is required, not department
    if (!faculty) {
      return res.status(400).json({ error: "Faculty is required for dean role." });
    }

    // Look up the faculty by name
    const facultyRecord = await Faculty.findOne({ name: faculty });
    if (!facultyRecord) {
      return res.status(400).json({ error: "Faculty not found." });
    }

    req.body.faculty = facultyRecord.name;
    req.body.department = null; // Set department to null as it's not required for dean
  } else if (role !== 'Admin' && role !== 'Vice Chancellor') {
    // For all other roles except 'admin' and 'vc', both faculty and department are required
    if (!faculty || !department) {
      return res.status(400).json({ error: "Faculty and department are required." });
    }

    // Look up the faculty by name
    const facultyRecord = await Faculty.findOne({ name: faculty });
    if (!facultyRecord) {
      return res.status(400).json({ error: "Faculty not found." });
    }

    // Look up the department by name within the selected faculty's departments
    const departmentRecord = facultyRecord.departments.find(dept => dept.name === department);
    if (!departmentRecord) {
      return res.status(400).json({ error: "Department not found in selected faculty." });
    }

    req.body.faculty = facultyRecord.name;
    req.body.department = departmentRecord.name;
  } else {
    // For admin and vc roles, we omit faculty and department
    delete req.body.faculty;
    delete req.body.department;
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with faculty and department (if applicable)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      faculty: req.body.faculty || null,  // Use null if faculty is not required
      department: req.body.department || null,  // Use null if department is not required
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during user registration:", err);

    // Handle duplicate email error
    if (err.code === 11000 && err.keyValue?.email) {
      return res.status(400).json({ error: "Email already exists." });
    }

    res.status(500).json({ error: "Server error during user registration." });
  }
});






// Signin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    //const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3h" });//Expired Time
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        faculty: user.faculty, // Include faculty
        department: user.department, // Include department
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Exclude password in response
    const { password: _, ...userDetails } = user.toObject();
    res.json({ token, user: userDetails });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during sign-in. Please try again." });
  }
});

//Fetch Faculties
router.get("/faculties", async (req, res) => {
  try {
    const faculties = await Faculty.find(); // Fetch all faculties
    res.status(200).json(faculties);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ error: "Failed to fetch faculties." });
  }
});


// Route to fetch departments by facultyId
router.get("/departments/:facultyId", async (req, res) => {
  const { facultyId } = req.params; // Get facultyId from the URL parameters

  try {
    // Find the faculty by facultyId and populate the departments array
    const faculty = await Faculty.findById(facultyId); // Use findById to find the specific faculty by ID

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Return the departments array from the faculty document
    res.status(200).json(faculty.departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments." });
  }
});


// Route to fetch departments by faculty name
router.get("/departments-by-name/:facultyName", async (req, res) => {
  const { facultyName } = req.params; // Get facultyName from the URL parameters

  try {
    // Find the faculty by facultyName
    const faculty = await Faculty.findOne({ name: facultyName }); // Use findOne to search by faculty name

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Return the departments array from the faculty document
    res.status(200).json(faculty.departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments." });
  }
});




// Route to fetch all registered users
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Sort by creation date (newest first)

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});



//update user
router.put("/update-user/:id", async (req, res) => {
  try {
    const { username, email, password, role, faculty, department } = req.body;
    const userId = req.params.id;

    // Validate the required fields
    if (!username || !email || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user details
    user.username = username;
    user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt); // Hash password
      user.password = hashedPassword;
    }
    user.role = role;
    user.faculty = faculty || user.faculty; // Keep current faculty if not provided
    user.department = department || user.department; // Keep current department if not provided

    // Save the updated user
    await user.save();

    res.json({ message: "User updated successfully.", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});



// DELETE user by ID
router.delete("/delete-user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update last active
router.put("/updateLastActive", async (req, res) => {
  const { email } = req.body;
  try {
    await User.findOneAndUpdate({ email }, { lastActive: new Date() });
    res.status(200).json({ message: "Last active updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update last active." });
  }
});

// Password-changing by user
router.put("/change-password", async (req, res) => {
  //console.log(request.body.bodydata);
  const { userId, password } = req.body;

  try {
    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.isPasswordChanged) {
      return res.status(403).send("Password already changed");
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isPasswordChanged = true;

    await user.save();
    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).send("An error occurred. Please try again later.");
  }
});




module.exports = router;
