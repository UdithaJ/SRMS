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
    
    // Extract query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 means no limit (fetch all)
    const skip = limit > 0 ? (page - 1) * limit : 0;
    
    // Extract filter parameters
    const { status, section, assignee, acknowledgement } = req.query;
    
    // Build the filter query
    let filterQuery = {};
    
    // Status filter (can be comma-separated list)
    if (status) {
      const statusArray = status.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
      if (statusArray.length > 0) {
        filterQuery.status = { $in: statusArray };
      }
    }
    
    // Assignee filter (can be comma-separated list of user IDs)
    if (assignee) {
      const assigneeArray = assignee.split(',').map(a => a.trim()).filter(a => a);
      if (assigneeArray.length > 0) {
        filterQuery.assignee = { $in: assigneeArray };
      }
    }
    
    // Acknowledgement filter (can be comma-separated list)
    if (acknowledgement) {
      const acknowledgementArray = acknowledgement.split(',').map(a => a.trim()).filter(a => a);
      if (acknowledgementArray.length > 0) {
        // Filter only records that have an acknowledgement value and it matches one of the selected values
        filterQuery.$and = filterQuery.$and || [];
        filterQuery.$and.push({
          acknowledgement: { $in: acknowledgementArray }
        });
        filterQuery.$and.push({
          acknowledgement: { $ne: null }
        });
        filterQuery.$and.push({
          acknowledgement: { $ne: '' }
        });
      }
    }

    let inquiries = [];
    let totalCount = 0;

    if (loggedInUser.userRole === 'section staff') {
      const user = await User.findById(loggedInUser.userId);
      const userSectionId = user.section;

      // Only fetch inquiries where requirement.section matches the user's section
      inquiries = await Inquiry.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'requirement',
          populate: { path: 'section' },
          match: { section: userSectionId }
        })
        .populate({
          path: 'assignee',
          select: 'firstName lastName referenceNo'
        });

      // Remove inquiries where requirement is null (i.e., not in user's section)
      inquiries = inquiries.filter(inquiry => inquiry.requirement);
      
      // Apply section filter if specified (after population)
      if (section) {
        const sectionArray = section.split(',').map(s => s.trim()).filter(s => s);
        if (sectionArray.length > 0) {
          inquiries = inquiries.filter(inquiry => 
            inquiry.requirement?.section?._id && 
            sectionArray.includes(inquiry.requirement.section._id.toString())
          );
        }
      }
      
      totalCount = inquiries.length;
    } else {
      // Count total for pagination
      const countQuery = { ...filterQuery };
      
      // If section filter is provided, we need to get requirement IDs that match those sections first
      if (section) {
        const sectionArray = section.split(',').map(s => s.trim()).filter(s => s);
        if (sectionArray.length > 0) {
          // Import Requirement model to query
          const Requirement = (await import('../models/requirement.js')).default;
          const requirements = await Requirement.find({ section: { $in: sectionArray } }).select('_id');
          const requirementIds = requirements.map(r => r._id);
          countQuery.requirement = { $in: requirementIds };
        }
      }
      
      totalCount = await Inquiry.countDocuments(countQuery);
      
      inquiries = await Inquiry.find(countQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'requirement',
          populate: { path: 'section' }
        })
        .populate({
          path: 'assignee',
          select: 'firstName lastName referenceNo'
        });
    }

    // Return with pagination metadata
    res.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: limit > 0 ? Math.ceil(totalCount / limit) : 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET by ID with populated requirement, section, and full assignee details (including profile image)
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate({
        path: 'requirement',
        populate: { path: 'section' }
      })
      .populate({
        path: 'assignee',
        select: 'firstName lastName referenceNo profileImage'
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