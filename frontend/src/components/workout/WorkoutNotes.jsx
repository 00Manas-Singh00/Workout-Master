import React, { useState } from 'react';
import { Save, X, Edit2, Trash2, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';

const WorkoutNotes = ({ sessionId, initialNotes = [], onSave, className = '' }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const { success, error } = useToast();

  const handleSave = async () => {
    try {
      await onSave(sessionId, notes);
      success('Notes saved successfully');
      setIsEditing(false);
    } catch (err) {
      error('Failed to save notes');
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setNotes([...notes, note]);
    setNewNote('');
    setShowAddModal(false);
    setIsEditing(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote(note.content);
    setShowAddModal(true);
  };

  const handleUpdateNote = () => {
    if (!newNote.trim() || !editingNote) return;
    
    setNotes(
      notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, content: newNote.trim(), timestamp: new Date().toISOString() }
          : n
      )
    );
    setNewNote('');
    setEditingNote(null);
    setShowAddModal(false);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    setIsEditing(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card variant="elevated" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workout Notes
        </h3>
        <div className="flex gap-2">
          {!isEditing && notes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={Edit2}
            >
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                icon={Save}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setNotes(initialNotes);
                }}
                icon={X}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingNote(null);
              setNewNote('');
              setShowAddModal(true);
            }}
            icon={Plus}
          >
            Add Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No notes yet</p>
          <p className="text-sm">Add notes to track your workout thoughts and observations</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <Card
              key={note.id}
              variant="default"
              padding="sm"
              className="relative group"
            >
              <p className="text-gray-700 dark:text-gray-300 mb-2">{note.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(note.timestamp)}
                </span>
                {isEditing && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleEditNote(note)}
                      icon={Edit2}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteNote(note.id)}
                      icon={Trash2}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewNote('');
          setEditingNote(null);
        }}
        title={editingNote ? 'Edit Note' : 'Add Note'}
        size="md"
      >
        <Input.Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write your workout notes here..."
          rows={4}
          fullWidth
        />
        <Modal.Footer>
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddModal(false);
              setNewNote('');
              setEditingNote(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={editingNote ? handleUpdateNote : handleAddNote}
          >
            {editingNote ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default WorkoutNotes;
