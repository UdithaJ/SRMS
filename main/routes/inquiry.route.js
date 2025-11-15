import express from 'express';
import Inquiry from '../models/inquiry.js';
import User from '../models/user.js';
const router = express.Router();
import { AuthService } from '../services/auth.service.js'

// CREATE Inquiry
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nic,
      requirement,
      rating,
      assignee,
      acknowledgement,
      notes,
      status
    } = req.body;

    const newInquiry = new Inquiry({
      firstName,
      lastName,
      nic,
      requirement,
      rating,
      assignee,
      acknowledgement,
      notes,
      status
    });

    await newInquiry.save();
    res.json({ message: 'Inquiry created successfully', inquiry: newInquiry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL inquiries with requirement and section populated
router.get('/', async (req, res) => {
  try {
    const loggedInUser = AuthService.getLoggedInUser();
    let inquiries = [];

    if (loggedInUser.userRole === 'section staff') {
      const user = await User.findById(loggedInUser.userId); // don't forget await
      const userSectionId = user.section;

      // Only fetch inquiries where requirement.section matches the user's section
      inquiries = await Inquiry.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'requirement',
          populate: { path: 'section' },
          match: { section: userSectionId } // filter by user's section
        });

      // Remove inquiries where requirement is null (i.e., not in user's section)
      inquiries = inquiries.filter(inquiry => inquiry.requirement);
    } else {
      inquiries = await Inquiry.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'requirement',
          populate: { path: 'section' }
        });
    }

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET by ID with populated requirement and section
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate({
        path: 'requirement',
        populate: { path: 'section' }
      });

    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Inquiry
router.put('/:id', async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    )
    .populate({
      path: 'requirement',
      populate: { path: 'section' }
    });

    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry updated successfully', inquiry: updatedInquiry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE Inquiry
router.delete('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;