import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ✅ Get all jobs (public or protected depending on your app)
router.route('/')
  .get(getAllJobs) // You can add `protect` if jobs list should require login
  .post(protect, authorize('recruiter'), createJob);

// ⚠️ Important: define this BEFORE the “/:id” route to avoid route conflicts
router.get('/recruiter/my-jobs', protect, getRecruiterJobs);

// ✅ Job by ID operations
router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('recruiter'), updateJob)
  .delete(protect, authorize('recruiter'), deleteJob);

export default router;
