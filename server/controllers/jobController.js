import Job from '../models/Job.js';
import RecruiterProfile from '../models/RecruiterProfile.js';

// ✅ Get all jobs (with filters)
export const getAllJobs = async (req, res) => {
  try {
    const { search, location, category, type } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (category) query.category = category;
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    const jobsWithProfiles = await Promise.all(
      jobs.map(async (job) => {
        const recruiterProfile = await RecruiterProfile.findOne({ user: job.recruiter._id });
        return { ...job.toObject(), recruiterProfile };
      })
    );

    res.json(jobsWithProfiles);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get a job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const recruiterProfile = await RecruiterProfile.findOne({ user: job.recruiter._id });
    res.json({ ...job.toObject(), recruiterProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create a new job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      category,
      salary,
      description,
      requirements,
      postedBy,
    } = req.body;

    // Recruiter ID can come from either token or frontend
    const recruiterId = req.user?._id || postedBy;

    if (!recruiterId) {
      return res.status(400).json({ message: 'Recruiter ID is required' });
    }

    const job = await Job.create({
      recruiter: recruiterId,
      title,
      company,
      location,
      type,
      category,
      salary,
      description,
      requirements,
      status: 'active',
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all jobs for a recruiter
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

