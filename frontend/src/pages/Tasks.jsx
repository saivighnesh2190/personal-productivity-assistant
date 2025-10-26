import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import { tasksAPI, aiAPI } from '../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  const priorityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await tasksAPI.getAll(filterStatus || null, filterPriority || null);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await tasksAPI.search(searchTerm);
        setTasks(response.data);
      } catch (error) {
        console.error('Error searching tasks:', error);
      }
    } else {
      fetchTasks();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      
      if (editingTask) {
        await tasksAPI.update(editingTask.id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }
      fetchTasks();
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleGenerateTasks = async () => {
    if (!aiText.trim()) return;
    
    try {
      setIsGenerating(true);
      const response = await aiAPI.generateTasks(aiText, true);
      if (response.data.created) {
        alert(`Successfully generated ${response.data.tasks.length} tasks!`);
        fetchTasks();
        setShowAIModal(false);
        setAiText('');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
    });
  };

  const getOverdueIndicator = (task) => {
    if (task.dueDate && task.status !== 'COMPLETED' && task.status !== 'CANCELLED') {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return <AlertTriangle className="w-4 h-4 text-red-500" title="Overdue" />;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage and track your productivity</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                AI Generate
              </button>
              
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks found</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      {getOverdueIndicator(task)}
                      {task.aiGenerated && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          AI Generated
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {task.aiSuggestion && (
                      <div className="bg-purple-50 p-2 rounded text-sm text-purple-700 mb-3">
                        AI Suggestion: {task.aiSuggestion}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => openModal(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingTask ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* AI Generate Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Task Generator
                </h2>
                <p className="text-gray-600 mb-6">
                  Describe your project or goals, and AI will generate tasks for you
                </p>
                
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="E.g., I need to prepare for a job interview next week..."
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                />
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAIModal(false);
                      setAiText('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateTasks}
                    disabled={!aiText.trim() || isGenerating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Tasks
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
