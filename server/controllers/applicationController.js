import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';

export const applyForJob = async (req, res) => {
  try {
    const { coverLetter, resumeUrl } = req.body;

    const existingApplication = await Application.findOne({
      job: req.params.jobId,
      student: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      job: req.params.jobId,
      student: req.user._id,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'pending',
      appliedDate: new Date().toISOString(),
    });

    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicantsCount: 1 } });

    res.status(201).json({ ...application.toObject(), id: application._id });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('student', 'name email degree university graduationYear skills')
      .sort({ createdAt: -1 });

    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const studentProfile = await StudentProfile.findOne({ user: app.student._id });
        return {
          ...app.toObject(),
          id: app._id, // For frontend consistency
          student: {
            ...app.student.toObject(),
            ...(studentProfile ? studentProfile.toObject() : {}),
          },
        };
      })
    );

    res.json(applicationsWithProfiles);
  } catch (error) {
    console.error('Error in getJobApplicants:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json({
      ...application.toObject(),
      id: application._id, // Keep consistent with frontend
    });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: error.message });
  }
};
