import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  updateProfile,
  updateStudentProfile,
  updateRecruiterProfile,
  getAllUsers,
  approveRecruiter,
  blockUser,
  uploadStudentAvatar,
  uploadStudentResume,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Multer setup for avatar uploads
const avatarsDir = path.join(process.cwd(), 'server', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${req.params.userId}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// Separate storage for resumes
const resumesDir = path.join(process.cwd(), 'server', 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${req.params.userId}-${uniqueSuffix}${ext}`);
  },
});
const uploadResumeMw = multer({ storage: resumeStorage });

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:userId', protect, updateProfile);
router.put('/:userId/student-profile', protect, updateStudentProfile);
router.post('/:userId/student-profile/avatar', protect, upload.single('avatar'), uploadStudentAvatar);
router.post('/:userId/student-profile/resume', protect, uploadResumeMw.single('resume'), uploadStudentResume);
router.put('/:userId/recruiter-profile', protect, updateRecruiterProfile);
router.put('/:recruiterId/approve', protect, authorize('admin'), approveRecruiter);
router.put('/:userId/block', protect, authorize('admin'), blockUser);

export default router;
