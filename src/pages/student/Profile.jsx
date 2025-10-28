import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import Toast from '../../components/Toast';
import { User, Mail, Phone, GraduationCap, Calendar, FileText, Plus, X, Upload } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    university: user.university || '',
    degree: user.degree || '',
    graduationYear: user.graduationYear || '',
  });
  const [skills, setSkills] = useState(user.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [resume, setResume] = useState(user.resume || null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = { ...formData, skills, resume };
      await userAPI.updateProfile(user._id, updatedData);
      updateUser(updatedData);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // add/remove skill
  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // handle resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      // Example: upload logic (replace with your API logic)
      // const uploadedResumeUrl = await userAPI.uploadResume(user._id, file);

      // For demo purposes, just store file name locally
      const uploadedResumeUrl = file.name;

      setResume(uploadedResumeUrl);
      setToast({ message: 'Resume uploaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Resume upload failed:', error);
      setToast({ message: 'Failed to upload resume', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and resume</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', name: 'name', type: 'text', icon: <User className="w-4 h-4 inline mr-2" /> },
                  { label: 'Email Address', name: 'email', type: 'email', icon: <Mail className="w-4 h-4 inline mr-2" /> },
                  { label: 'Phone Number', name: 'phone', type: 'tel', icon: <Phone className="w-4 h-4 inline mr-2" /> },
                  { label: 'University', name: 'university', type: 'text', icon: <GraduationCap className="w-4 h-4 inline mr-2" /> },
                  { label: 'Degree', name: 'degree', type: 'text', icon: <FileText className="w-4 h-4 inline mr-2" /> },
                  { label: 'Graduation Year', name: 'graduationYear', type: 'number', icon: <Calendar className="w-4 h-4 inline mr-2" />, min: 2024, max: 2035 },
                ].map(({ label, name, type, icon, min, max }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {icon}
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required
                      min={min}
                      max={max}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    {resume ? `Uploaded: ${resume}` : 'No resume uploaded yet'}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center mx-auto gap-2"
                  >
                    <Upload className="w-4 h-4" /> Upload Resume
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;
