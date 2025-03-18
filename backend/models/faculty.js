const mongoose = require('mongoose');

// Define the Department schema as a nested schema
const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Define the Faculty schema with departments as a nested array of subdocuments
const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  departments: [DepartmentSchema] // Departments as a nested array of subdocuments
});

const Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = Faculty;



