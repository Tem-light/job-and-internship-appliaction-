import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';

// Utility function to handle errors
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: error.message });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Authorization check
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email; // Ensure email can also be updated
    user.phone = req.body.phone || user.phone; // Ensure phone can also be updated

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    // Authorization: only owner can update their profile
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { university, degree, graduationYear, skills, resumeUrl, phone, avatarUrl, githubUrl, linkedinUrl } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.params.userId },
      {
        university,
        degree,
        graduationYear,
        skills,
        resumeUrl,
        phone,
        avatarUrl,
        githubUrl,
        linkedinUrl,
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    handleError(res, error);
  }
};

// Upload avatar and update student's avatarUrl
export const uploadStudentAvatar = async (req, res) => {
  try {
    // Authorization: only owner can upload their avatar
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to upload avatar for this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const publicUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.params.userId },
      { avatarUrl: publicUrl },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({ avatarUrl: publicUrl, profile });
  } catch (error) {
    handleError(res, error);
  }
};

// Upload resume and update student's resumeUrl
export const uploadStudentResume = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to upload resume for this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const publicUrl = `${baseUrl}/uploads/resumes/${req.file.filename}`;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.params.userId },
      { resumeUrl: publicUrl },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({ resumeUrl: publicUrl, profile });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateRecruiterProfile = async (req, res) => {
  try {
    const { company, companyDescription, website, logoUrl } = req.body;

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.params.userId },
      {
        company,
        companyDescription,
        website,
        logoUrl,
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    handleError(res, error);
  }
};

export const approveRecruiter = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.params.recruiterId },
      { approved: true },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    handleError(res, error);
  }
};
// Block a user (student or recruiter)
export const blockUser = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.params.userId },
      { blocked: true },
      { new: true }
    );

    if (!profile) {
      // If it's not a recruiter, try blocking a student profile
      const studentProfile = await StudentProfile.findOneAndUpdate(
        { user: req.params.userId },
        { blocked: true },
        { new: true }
      );

      if (!studentProfile) {
        return res.status(404).json({ message: 'User profile not found' });
      }

      return res.status(200).json(studentProfile);
    }

    res.status(200).json(profile);
  } catch (error) {
    handleError(res, error);
  }
};
