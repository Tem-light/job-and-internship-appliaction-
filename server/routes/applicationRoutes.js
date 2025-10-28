import express from 'express';
import {
  applyForJob,
  getStudentApplications,
  getJobApplicants,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/job/:jobId', protect, authorize('student'), applyForJob);
router.get('/student/my-applications', protect, authorize('student'), getStudentApplications);

// Recruiter routes
router.get('/job/:jobId/applicants', protect, authorize('recruiter'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

export default router;
