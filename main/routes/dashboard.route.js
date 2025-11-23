import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/user.js';
import Inquiry from '../models/inquiry.js';
import Section from '../models/section.js';

const router = express.Router();

// GET /api/dashboard - Get all dashboard statistics (requires authentication)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get counts
    const usersCount = await User.countDocuments();
    const inquiriesCount = await Inquiry.countDocuments();
    const sectionsCount = await Section.countDocuments();

    // Get all inquiries with necessary fields for charts
    const inquiries = await Inquiry.find()
      .select('status createdAt rating')
      .lean();

    // Calculate monthly counts
    const monthlyCounts = Array(12).fill(0);
    inquiries.forEach((inq) => {
      const month = new Date(inq.createdAt).getMonth();
      monthlyCounts[month]++;
    });

    // Calculate status counts
    const statusCounts = {};
    inquiries.forEach((inq) => {
      const statusKey = String(inq.status ?? 'unknown');
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });

    // Calculate average rating for "Work Done" inquiries (status = 2)
    // Ratings are on a 1-10 scale
    const workDoneInquiries = inquiries.filter(i => Number(i.status) === 2);
    const totalWorkDone = workDoneInquiries.length || 0;
    const sumRatings = workDoneInquiries.reduce((sum, i) => sum + (Number(i.rating) || 0), 0);
    const avgRating = totalWorkDone ? (sumRatings / totalWorkDone) : 0;

    res.json({
      usersCount,
      inquiriesCount,
      sectionsCount,
      monthlyCounts,
      statusCounts,
      avgRating
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: err.message });
  }
});

export default router;
