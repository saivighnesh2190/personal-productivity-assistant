import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Archive, Sparkles, FileText } from 'lucide-react';
import { notesAPI, aiAPI } from '../services/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [showArchived]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesAPI.getAll(showArchived);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await notesAPI.search(searchTerm);
        setNotes(response.data);
      } catch (error) {
        console.error('Error searching notes:', error);
      }
    } else {
      fetchNotes();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await notesAPI.update(editingNote.id, formData);
      } else {
        await notesAPI.create(formData);
      }
      fetchNotes();
      closeModal();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(id);
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleArchive = async (note) => {
    try {
      await notesAPI.update(note.id, { ...note, archived: !note.archived });
      fetchNotes();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleSummarize = async (noteId) => {
    try {
      setIsSummarizing(true);
      const response = await aiAPI.summarizeNote(noteId);
      fetchNotes();
      alert('Note summarized successfully!');
    } catch (error) {
      console.error('Error summarizing note:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || '',
        category: note.category || '',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        category: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      category: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-2">Capture and organize your thoughts</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search notes..."
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
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-md ${
                  showArchived ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Archive className="w-5 h-5" />
              </button>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Note
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notes found</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{note.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSummarize(note.id)}
                      disabled={isSummarizing}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Generate AI Summary"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal(note)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(note)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {note.category && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
                    {note.category}
                  </span>
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-3">{note.content || 'No content'}</p>
                
                {note.aiSummary && (
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-purple-900 mb-1">AI Summary:</p>
                    <p className="text-sm text-purple-700 line-clamp-2">{note.aiSummary}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-4">
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
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
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Work, Personal, Ideas"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      {editingNote ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
