import express from 'express';
import {
  updateProfile,
  updateStudentProfile,
  updateRecruiterProfile,
  getAllUsers,
  approveRecruiter,
  blockUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:userId', protect, updateProfile);
router.put('/:userId/student-profile', protect, updateStudentProfile);
router.put('/:userId/recruiter-profile', protect, updateRecruiterProfile);
router.put('/:recruiterId/approve', protect, authorize('admin'), approveRecruiter);
router.put('/:userId/block', protect, authorize('admin'), blockUser);

export default router;
