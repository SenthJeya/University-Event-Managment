const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Event = require("../models/event"); 
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const util = require("util");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

// Promisify fs.unlink for asynchronous file deletion
const unlinkFile = util.promisify(fs.unlink);

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files temporarily in an uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .pdf and .docx files are allowed!"), false);
    }
  },
  limits: { files: 5, fileSize: 10 * 1024 * 1024 }, // Max 5 files and 10MB file size limit
}).array("files", 5); // Max 5 files per request

// Event creation route
router.post("/create", upload, async (req, res) => {

  const { name, date, time, venue, description, faculty, department, organizedBy } = req.body;

  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one file is required!" });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.body.userId);

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Upload files to Cloudinary
    const fileUrls = [];
    for (const file of req.files) {
      try {
        // Upload the file to Cloudinary as a raw file
        const uploadedFile = await cloudinary.uploader.upload(file.path, {
          folder: "events_files",
          resource_type: "raw", // Always use "raw" for both .docx and .pdf files
          timeout: 60000, // Increase timeout to 60 seconds
        });
        fileUrls.push(uploadedFile.secure_url);

        // Delete the temporary file after successful upload to Cloudinary
        try {
          await unlinkFile(file.path);
          console.log("File deleted:", file.path);
        } catch (err) {
          console.error("Error deleting file:", file.path, err);
        }
      } catch (error) {
        if (error.http_code === 499) {
          console.error("Cloudinary upload timed out. Retrying...");

          // Retry the upload
          try {
            const uploadedFile = await cloudinary.uploader.upload(file.path, {
              folder: "events_files",
              resource_type: "raw", // Always use "raw" for both .docx and .pdf files
              timeout: 60000, // Increase timeout for retry
            });
            fileUrls.push(uploadedFile.secure_url);

            // Delete the temporary file after successful upload to Cloudinary
            try {
              await unlinkFile(file.path);
              console.log("File deleted:", file.path);
            } catch (err) {
              console.error("Error deleting file:", file.path, err);
            }
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            return res.status(500).json({ message: "Failed to upload files to Cloudinary after retry." });
          }
        } else {
          console.error("Error uploading file to Cloudinary:", error);
          return res.status(500).json({ message: "Failed to upload files to Cloudinary." });
        }
      }
    }

    // Create the event, including the uploaded file URLs
    const event = new Event({
      name,
      date,
      time,
      venue,
      description,
      userId, 
      faculty,
      department,
      organizedBy,
      files: fileUrls, 
    });

    // Save the event
    await event.save();

    return res.status(201).json({ message: "Event created successfully!", event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while creating the event." });
  }
});


// Fetch created events
router.get("/created-events", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get the current logged-in user's ID

    // Fetch events where the userId matches the logged-in user's ID
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const events = await Event.find({ userId: userIdObjectId });

    // Add creator role to each event
    const eventsWithCreatorRole = await Promise.all(
      events.map(async (event) => {
        const creatorUser = await User.findById(event.userId).select("role");
        return {
          ...event.toObject(),
          creatorRole: creatorUser ? creatorUser.role : null,
        };
      })
    );

    res.status(200).json(eventsWithCreatorRole || []);
  } catch (error) {
    console.error("Error fetching created events:", error);
    res.status(500).json({ message: "An error occurred while fetching events." });
  }
});

//fetch event based on department
router.get("/department-events", authenticateToken, async (req, res) => {
  try {
    //console.log("req.user:", req.user); // Log the req.user object
    const userDepartment = req.user.department; // Get the current logged-in user's department
    const userId = req.user.id; // Get the current logged-in user's ID

    // Convert userId to ObjectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const events = await Event.find({
      department: userDepartment,
      userId: { $ne: userIdObjectId }, 
      hodApprovalStatus: "pending",
    });

    // Add creator role to each event
    const eventsWithCreatorRole = await Promise.all(
      events.map(async (event) => {
        const creatorUser = await User.findById(event.userId).select("role");
        return {
          ...event.toObject(),
          creatorRole: creatorUser ? creatorUser.role : null,
        };
      })
    );

    res.status(200).json(eventsWithCreatorRole || []);
  } catch (error) {
    console.error("Error fetching department events:", error);
    res.status(500).json({ message: "An error occurred while fetching events." });
  }
});



//dean pending events
router.get("/faculty-events", authenticateToken, async (req, res) => {
  try {
    const userFaculty = req.user.faculty; // Get the current logged-in user's department
    const userId = req.user.id; // Get the current logged-in user's ID

    // Convert userId to ObjectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const events = await Event.find({
      faculty: userFaculty,
      userId: { $ne: userIdObjectId }, 
      hodApprovalStatus: "approved",
    });

    // Add creator role to each event
    const eventsWithCreatorRole = await Promise.all(
      events.map(async (event) => {
        const creatorUser = await User.findById(event.userId).select("role");
        return {
          ...event.toObject(),
          creatorRole: creatorUser ? creatorUser.role : null,
        };
      })
    );

    res.status(200).json(eventsWithCreatorRole || []);
  } catch (error) {
    console.error("Error fetching department events:", error);
    res.status(500).json({ message: "An error occurred while fetching events." });
  }
});


//vc pending events
router.get("/vc-events", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get the current logged-in user's ID

    // Convert userId to ObjectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const events = await Event.find({
      hodApprovalStatus: "approved",
      deanApprovalStatus: "approved",
      userId: { $ne: userIdObjectId }, 
    });

    // Add creator role to each event
    const eventsWithCreatorRole = await Promise.all(
      events.map(async (event) => {
        const creatorUser = await User.findById(event.userId).select("role");
        return {
          ...event.toObject(),
          creatorRole: creatorUser ? creatorUser.role : null,
        };
      })
    );

    res.status(200).json(eventsWithCreatorRole || []);
  } catch (error) {
    console.error("Error fetching Vice Chancellor events:", error);
    res.status(500).json({ message: "An error occurred while fetching events." });
  }
});

//approve event
router.put("/:eventId/approve", (req, res) => {
  const eventId = req.params.eventId;
  const { hodApprovalStatus, deanApprovalStatus, vcApprovalStatus } = req.body;

  Event.findByIdAndUpdate(
    eventId,
    { $set: { hodApprovalStatus, deanApprovalStatus, vcApprovalStatus } },
    { new: true }
  )
    .then((event) => res.json(event))
    .catch((err) => res.status(500).json({ error: err.message }));
});

//reject event
router.put("/:eventId/reject", (req, res) => {
  const eventId = req.params.eventId;
  const {
    hodApprovalStatus,
    hodRejectionMessage,
    deanApprovalStatus,
    deanRejectionMessage,
    vcApprovalStatus,
    vcRejectionMessage,
  } = req.body;

  Event.findByIdAndUpdate(
    eventId,
    {
      $set: {
        hodApprovalStatus,
        hodRejectionMessage,
        deanApprovalStatus,
        deanRejectionMessage,
        vcApprovalStatus,
        vcRejectionMessage,
      },
    },
    { new: true }
  )
    .then((event) => res.json(event))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Edit event route
router.put("/event-edit/:id", authenticateToken, async (req, res) => {
  const { id } = req.params; // Event ID from the URL
  const { name, date, time, venue, description } = req.body; // Updated event data

  try {
    // Find the event by ID and update it
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        name,
        date, 
        time, 
        venue,
        description,
      },
      { new: true } // Return the updated event
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Send the updated event as the response
    res.status(200).json({ message: "Event updated successfully!", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event." });
  }
});


// Delete event route
router.delete("/event-delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    console.log(id);
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully!", event: deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event." });
  }
});

// Fetch all approved events
router.get("/events-approved", async (req, res) => {
  try {
    // Find events where all approval statuses are "approved"
    const approvedEvents = await Event.find({
      hodApprovalStatus: "approved",
      deanApprovalStatus: "approved",
      vcApprovalStatus: "approved",
    });

    // Send the approved events as the response
    res.status(200).json(approvedEvents);
  } catch (error) {
    console.error("Error fetching approved events:", error);
    res.status(500).json({ message: "Failed to fetch approved events." });
  }
});


module.exports = router;