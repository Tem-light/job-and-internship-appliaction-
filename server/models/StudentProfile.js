import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    university: {
      type: String,
      default: '',
    },
    degree: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: Number,
      default: 2025,
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    // New fields for richer student profiles
    avatarUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

export default StudentProfile;
