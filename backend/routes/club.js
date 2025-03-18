const express = require("express");
const bcrypt = require("bcrypt");
const Club = require("../models/club"); // Assume the Club model is defined for MongoDB
const router = express.Router();

// Fetch all clubs
router.get('/list', async (req, res) => {
  try {
      const clubs = await Club.find().lean();  // Fetch clubs and use .lean() to get plain JavaScript objects

      if (clubs.length === 0) {
          return res.status(200).json({ message: 'No clubs found. Please create some clubs.' });
      }

      // Return the clubs as an array
      res.status(200).json(clubs);  // Send clubs as an array
  } catch (error) {
      res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
});

// Add a new club
router.post("/createclub", async (req, res) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newClub = new Club({ name, password: hashedPassword });
    await newClub.save();
    res.json({ message: "Club created successfully.", club: newClub });
  } catch (err) {
    res.status(500).json({ error: "Failed to create club" });
  }
});

// Update an existing club
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  try {
    // Find the club first
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Prepare the update object
    const updateData = { name };

    // Hash the password only if a new one is provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update the club in the database
    const updatedClub = await Club.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: "Club updated successfully.", club: updatedClub });
  } catch (err) {
    res.status(500).json({ error: "Failed to update club" });
  }
});

// Delete a club
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Club.findByIdAndDelete(id);
    res.json({ message: "Club deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete club" });
  }
});


//Validate club password
router.get("/validate", async (req, res) => {
  try {
    // Extracting clubId and clubPassword from query parameters
    const { clubId, clubPassword } = req.query;  // Use req.query for GET request

    // Check if the required fields are provided
    if (!clubId || !clubPassword) {
      return res.status(400).json({ valid: false, message: "Missing club ID or password." });
    }

    // Find the club by ID
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ valid: false, message: "Club not found." });
    }

    // Compare the provided password with the club's stored password
    // If using hashed passwords:
    const isPasswordValid = await bcrypt.compare(clubPassword, club.password);

    if (isPasswordValid) {
      return res.status(200).json({ valid: true, message: "Password is correct." });
    } else {
      return res.status(401).json({ valid: false, message: "Incorrect password." });
    }
  } catch (error) {
    console.error("Error validating club password:", error);
    return res.status(500).json({ valid: false, message: "An error occurred. Please try again later." });
  }
});



module.exports = router;
