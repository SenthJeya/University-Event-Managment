const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty'); // Assuming Faculty is the mongoose model

// Create a new faculty
router.post('/facultycreate', async (req, res) => {
  try {
    const { name } = req.body;
    const newFaculty = new Faculty({ name, departments: [] });
    await newFaculty.save();
    res.status(201).json({ message: 'Faculty created successfully', faculty: newFaculty });
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty', error: error.message });
  }
});

// Edit a faculty
router.put('/facultyedit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedFaculty = await Faculty.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json({ message: 'Faculty updated successfully', faculty: updatedFaculty });
  } catch (error) {
    res.status(500).json({ message: 'Error updating faculty', error: error.message });
  }
});

// Delete a faculty
router.delete('/facultydelete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json({ message: 'Faculty deleted successfully', faculty: deletedFaculty });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty', error: error.message });
  }
});



// Route to add a department to a faculty
router.post('/department/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Push the new department to the array
    faculty.departments.push({ name });

    // Save the updated document
    await faculty.save();

    res.status(200).json({ message: 'Department added successfully', faculty });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





// Edit a department's name
router.put('/departmentedit/:facultyId/department/:departmentId', async (req, res) => {
  try {
    const { facultyId, departmentId } = req.params;
    const { name } = req.body;

    // Find the faculty by ID
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Find the department within the faculty's departments array
    const department = faculty.departments.id(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update the department name
    department.name = name;

    // Save the updated faculty document
    await faculty.save();

    res.status(200).json({ 
      message: 'Department updated successfully', 
      department // Send back the updated department
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating department', 
      error: error.message 
    });
  }
});



// Delete a department
router.delete('/departmentdelete/:facultyId/department/:departmentId', async (req, res) => {
  try {
    const { facultyId, departmentId } = req.params;

    // Find the faculty by ID
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Use Mongoose's pull method to remove the department by its ID
    const departmentIndex = faculty.departments.findIndex(department => department._id.toString() === departmentId);

    if (departmentIndex === -1) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Pull the department from the array
    faculty.departments.pull(departmentId);

    // Save the updated faculty document
    await faculty.save();

    res.status(200).json({ message: 'Department deleted successfully', faculty });
  } catch (error) {
    console.error('Error in department deletion:', error); // Improved logging
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
});




// Fetch all faculties with departments
router.get('/list', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    if (faculties.length === 0) {
      return res.status(200).json({ message: 'No faculties found. Please create some faculties.' });
    }
    res.status(200).json({ faculties });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculties', error: error.message });
  }
});



module.exports = router;
