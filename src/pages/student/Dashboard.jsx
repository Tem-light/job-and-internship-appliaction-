import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { Briefcase, FileText, TrendingUp, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobs, applications] = await Promise.all([
        jobAPI.getAllJobs(),
        applicationAPI.getStudentApplications(user.id),
      ]);

      setRecentJobs(jobs.slice(0, 3));
      setStats({
        totalJobs: jobs.length,
        appliedJobs: applications.length,
        pendingApplications: applications.filter((app) => app.status === 'pending').length,
        acceptedApplications: applications.filter((app) => app.status === 'accepted').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">Here's your job search overview</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.totalJobs}</h3>
              <p className="text-gray-600 text-sm">Available Jobs</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.appliedJobs}</h3>
              <p className="text-gray-600 text-sm">Applied Jobs</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stats.pendingApplications}
              </h3>
              <p className="text-gray-600 text-sm">Pending</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stats.acceptedApplications}
              </h3>
              <p className="text-gray-600 text-sm">Accepted</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Job Postings</h2>
              <Link
                to="/student/jobs"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{job.title}</h3>
                      <p className="text-blue-600 font-semibold mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <Link
                      to="/student/jobs"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
            <p className="mb-6">
              A complete profile increases your chances of getting hired. Add your resume, skills,
              and experience.
            </p>
            <Link
              to="/student/profile"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
