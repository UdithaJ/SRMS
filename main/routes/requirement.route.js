import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import Requirement from '../models/requirement.js';

const router = express.Router();

// CREATE Requirement (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, section } = req.body;

    const exists = await Requirement.findOne({ name, section });
    if (exists) {
      return res.status(400).json({ message: 'Requirement already exists for this section' });
    }

    const newRequirement = new Requirement({ name, section });
    await newRequirement.save();

    res.json({ message: 'Requirement created successfully', requirement: newRequirement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Requirements by Section ID (requires authentication)
router.get('/section/:sectionId', verifyToken, async (req, res) => {
  try {
    const requirements = await Requirement.find({ section: req.params.sectionId }).sort({ createdAt: -1 });

    if (!requirements || requirements.length === 0) {
      return res.status(404).json({ message: 'No requirements found for this section' });
    }

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL Requirements (requires authentication)
router.get('/', verifyToken, async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET BY ID (requires authentication)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Requirement (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, section } = req.body;

    const exists = await Requirement.findOne({
      name,
      section,
      _id: { $ne: req.params.id }
    });

    if (exists) {
      return res.status(400).json({ message: 'Requirement already exists for this section' });
    }

    const updatedRequirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      { name, section },
      { new: true }
    );

    if (!updatedRequirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }

    res.json({ message: 'Requirement updated successfully', requirement: updatedRequirement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE Requirement (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    res.json({ message: 'Requirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
