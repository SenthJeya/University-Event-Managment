const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"], // Email validation regex
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "Admin",
        "Vice Chancellor",
        "Dean",
        "Head of Department",
        "Academic Staff",
        "Student",
      ], // Enum for predefined roles
    },
    faculty: {
      type: String,
      required: function () {
        // Faculty is required only for roles other than 'admin' and 'vc'
        return this.role !== "Admin" && this.role !== "Vice Chancellor";
      },
    },
    department: {
      type: String,
      required: function () {
        // Department is required for roles other than 'admin' and 'vc'.
        // Also not required for 'dean', but required for all other roles.
        return (
          this.role !== "Admin" &&
          this.role !== "Vice Chancellor" &&
          this.role !== "Dean"
        );
      },
    },
    lastActive: {
      type: Date,
      default: null, // Defaults to null until the user is active
    },
    isPasswordChanged: {
      type: Boolean,
      default: false, // Tracks if the user has already changed their password
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
