import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      required: [true, 'Please add a job type'],
    },
    category: {
      type: String,
      default: '',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    requirements: {
      type: [String],
      default: [],
    },
    // New fields
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicationStart: {
      type: Date,
    },
    applicationEnd: {
      type: Date,
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactWebsite: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
