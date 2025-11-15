import express from 'express';
import Section from '../models/section.js';
import Requirement from '../models/requirement.js';

const router = express.Router();

// Create a new section
router.post('/', async (req, res) => {
  try {
    const { sectionId, name } = req.body;

    // Check if sectionId already exists
    const existingSection = await Section.findOne({ sectionId });
    if (existingSection) {
      return res.status(400).json({ message: 'Section ID already exists' });
    }

    const newSection = new Section({ sectionId, name });
    await newSection.save();

    res.json({ message: 'Section created successfully', section: newSection });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sections WITH linked requirements
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find();

    const result = await Promise.all(
      sections.map(async (sec) => {
        const requirements = await Requirement.find({ section: sec._id }).sort({ createdAt: -1 });
        return {
          ...sec.toObject(),
          requirements
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single section by ID
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a section by ID
router.put('/:id', async (req, res) => {
  try {
    const { sectionId, name } = req.body;

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Optional: check if new sectionId is already taken
    if (sectionId && sectionId !== section.sectionId) {
      const existingSection = await Section.findOne({ sectionId });
      if (existingSection) {
        return res.status(400).json({ message: 'Section ID already exists' });
      }
      section.sectionId = sectionId;
    }

    if (name) section.name = name;

    await section.save();
    res.json({ message: 'Section updated successfully', section });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a section by ID
router.delete('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
