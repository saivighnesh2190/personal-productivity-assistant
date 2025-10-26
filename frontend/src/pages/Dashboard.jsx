import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { tasksAPI, notesAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalNotes: 0,
    overdueTasks: 0,
  });
  const [dailySummary, setDailySummary] = useState('');
  const [insights, setInsights] = useState('');
  const [taskTrends, setTaskTrends] = useState([]);
  const [priorityDistribution, setPriorityDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tasks and notes
      const [tasksRes, notesRes, overdueRes] = await Promise.all([
        tasksAPI.getAll(),
        notesAPI.getAll(),
        tasksAPI.getOverdue()
      ]);

      const tasks = tasksRes.data;
      const notes = notesRes.data;
      const overdueTasks = overdueRes.data;

      // Calculate stats
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const pending = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
      
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        totalNotes: notes.length,
        overdueTasks: overdueTasks.length,
      });

      // Calculate priority distribution
      const priorityCounts = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      };
      
      tasks.forEach(task => {
        if (priorityCounts[task.priority] !== undefined) {
          priorityCounts[task.priority]++;
        }
      });

      setPriorityDistribution([
        { name: 'Low', value: priorityCounts.LOW, color: '#10B981' },
        { name: 'Medium', value: priorityCounts.MEDIUM, color: '#3B82F6' },
        { name: 'High', value: priorityCounts.HIGH, color: '#F59E0B' },
        { name: 'Urgent', value: priorityCounts.URGENT, color: '#EF4444' },
      ]);

      // Generate task trends (last 7 days)
      const trends = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate.toDateString() === date.toDateString();
        });

        trends.push({
          day: dayName,
          created: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'COMPLETED').length,
        });
      }
      setTaskTrends(trends);

      // Fetch AI summaries
      try {
        const [summaryRes, insightsRes] = await Promise.all([
          aiAPI.getDailySummary(),
          aiAPI.getInsights()
        ]);
        setDailySummary(summaryRes.data.summary);
        setInsights(insightsRes.data.insights);
      } catch (error) {
        console.error('Error fetching AI data:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
          <p className="text-gray-600 mt-2">Here's your productivity overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={CheckCircle}
            color="bg-blue-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Pending"
            value={stats.pendingTasks}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatCard
            title="Notes"
            value={stats.totalNotes}
            icon={FileText}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Trends (7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taskTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Daily Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{dailySummary || 'Loading daily summary...'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              AI Insights
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{insights || 'Loading insights...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
