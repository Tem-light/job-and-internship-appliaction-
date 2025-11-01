import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import Notification from '../models/Notification.js';

export const applyForJob = async (req, res) => {
  const { coverLetter, resumeUrl } = req.body;
  const jobId = req.params.jobId; // Ensure this gets the correct job ID

  try {
    // Check for user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check application window
    const now = new Date();
    if (job.applicationStart && now < job.applicationStart) {
      return res.status(400).json({ message: 'Applications have not started yet' });
    }
    if (job.applicationEnd && now > job.applicationEnd) {
      return res.status(400).json({ message: 'Applications are closed' });
    }

    // Check capacity
    if (job.openings && job.applicantsCount >= job.openings) {
      return res.status(400).json({ message: 'Application limit reached for this job' });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      job: jobId,
      student: req.user._id,
    });
    
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'pending',
      appliedDate: new Date(),
    });

    // Increment applicants count
    try {
      job.applicantsCount = (job.applicantsCount || 0) + 1;
      await job.save();
    } catch (e) {
      console.warn('Failed to increment applicantsCount:', e.message);
    }

    // Create notifications
    try {
      // Notify recruiter
      await Notification.create({
        user: job.recruiter,
        type: 'application_created',
        message: `New application for ${job.title} from ${req.user.name}`,
        data: { jobId: job._id, applicationId: application._id, studentId: req.user._id },
      });
      // Notify student (confirmation)
      await Notification.create({
        user: req.user._id,
        type: 'application_submitted',
        message: `You applied to ${job.title} at ${job.company}`,
        data: { jobId: job._id, applicationId: application._id },
      });
    } catch (e) {
      console.warn('Failed to create notifications:', e.message);
    }

    res.status(201).json({ ...application.toObject(), id: application._id });
  } catch (error) {
    console.error('Error in applyForJob:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
export const getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user._id;

    const applications = await Application.find({ student: studentId })
      .populate({
        path: 'job',
        select: 'title company location type category salaryMin salaryMax description requirements',
      })
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map((app) => ({
      ...app.toObject(),
      id: app._id,
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error in getStudentApplications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getJobApplicants = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if the user is authorized to view applicants
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const userId = app.student?._id;
        const studentProfile = userId ? await StudentProfile.findOne({ user: userId }) : null;
        return {
          ...app.toObject(),
          id: app._id, // For frontend consistency
          student: app.student
            ? { ...app.student.toObject(), ...(studentProfile ? studentProfile.toObject() : {}) }
            : null,
        };
      })
    );

    res.json(applicationsWithProfiles);
  } catch (error) {
    console.error('Error in getJobApplicants:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check if the user is authorized to update this application
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Notify student about status change
    try {
      await Notification.create({
        user: application.student,
        type: 'application_status',
        message: `Your application for ${application.job.title} was ${status}`,
        data: { jobId: application.job._id, applicationId: application._id, status },
      });
    } catch (e) {
      console.warn('Failed to create status notification:', e.message);
    }

    res.json({
      ...application.toObject(),
      id: application._id, // Keep consistent with frontend
    });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};