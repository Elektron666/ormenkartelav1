import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Heart, Star, Lightbulb, Target, Zap, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { formatDate, formatDateTime } from '../utils/helpers';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'business' | 'inspiration' | 'goals';
  priority: 'low' | 'medium' | 'high';
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'ormen_personal_notes';

const categoryConfig = {
  personal: { 
    label: 'Kişisel', 
    color: 'from-purple-400 to-purple-600', 
    bgColor: 'bg-purple-50', 
    textColor: 'text-purple-700',
    icon: Heart 
  },
  business: { 
    label: 'İş', 
    color: 'from-blue-400 to-blue-600', 
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-700',
    icon: Target 
  },
  inspiration: { 
    label: 'İlham', 
    color: 'from-yellow-400 to-yellow-600', 
    bgColor: 'bg-yellow-50', 
    textColor: 'text-yellow-700',
    icon: Lightbulb 
  },
  goals: { 
    label: 'Hedefler', 
    color: 'from-green-400 to-green-600', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-700',
    icon: Zap 
  }
};

const priorityConfig = {
  low: { label: 'Düşük', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Orta', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Yüksek', color: 'bg-red-100 text-red-700' }
};

const inspirationalAnimals = [
  { emoji: '🦁', name: 'Aslan', message: 'Cesur ol, kral gibi düşün!' },
  { emoji: '🐘', name: 'Fil', message: 'Güçlü hafıza, büyük hedefler!' },
  { emoji: '🦅', name: 'Kartal', message: 'Yüksekten bak, uzağı gör!' },
  { emoji: '🐺', name: 'Kurt', message: 'Takım ruhu, liderlik!' },
  { emoji: '🐯', name: 'Kaplan', message: 'Güç ve kararlılık!' },
  { emoji: '🦋', name: 'Kelebek', message: 'Dönüşüm ve güzellik!' }
];

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filter, setFilter] = useState<'all' | 'personal' | 'business' | 'inspiration' | 'goals' | 'favorites'>('all');
  const [currentAnimal, setCurrentAnimal] = useState(inspirationalAnimals[0]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal' as Note['category'],
    priority: 'medium' as Note['priority']
  });

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Change inspirational animal every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimal(inspirationalAnimals[Math.floor(Math.random() * inspirationalAnimals.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return note.isFavorite;
    return note.category === filter;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'personal',
      priority: 'medium'
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority
    });
    setShowEditModal(true);
  };

  const handleDelete = (note: Note) => {
    if (window.confirm(`"${note.title}" notunu silmek istediğinizden emin misiniz?`)) {
      setNotes(prev => prev.filter(n => n.id !== note.id));
      toast.success('Not başarıyla silindi');
    }
  };

  const toggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date() }
        : note
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Not başlığı gerekli');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Not içeriği gerekli');
      return;
    }

    const noteData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      priority: formData.priority,
    };

    if (showEditModal && selectedNote) {
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id 
          ? { ...note, ...noteData, updatedAt: new Date() }
          : note
      ));
      toast.success('Not başarıyla güncellendi');
      setShowEditModal(false);
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        ...noteData,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
      toast.success('Not başarıyla eklendi');
      setShowAddModal(false);
    }
    
    resetForm();
    setSelectedNote(null);
  };

  const getStats = () => {
    return {
      total: notes.length,
      favorites: notes.filter(n => n.isFavorite).length,
      personal: notes.filter(n => n.category === 'personal').length,
      business: notes.filter(n => n.category === 'business').length,
      inspiration: notes.filter(n => n.category === 'inspiration').length,
      goals: notes.filter(n => n.category === 'goals').length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Inspirational Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-ormen-400 via-ormen-500 to-ormen-600 rounded-2xl p-8 text-white shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="text-6xl mr-4 animate-bounce-subtle">
                  {currentAnimal.emoji}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Kişisel Notlarım</h1>
                  <p className="text-ormen-100 text-lg">
                    {currentAnimal.message}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.total}</div>
                <div className="text-ormen-200">Toplam Not</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  <span className="font-medium">Motivasyon Merkezi</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-300" />
                  <span>{stats.favorites} Favori</span>
                </div>
              </div>
              <Button
                variant="secondary"
                icon={Plus}
                onClick={handleAdd}
                className="bg-white text-ormen-600 hover:bg-ormen-50"
              >
                Yeni Not
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Tümü ({stats.total})
        </Button>
        <Button
          variant={filter === 'favorites' ? 'primary' : 'outline'}
          onClick={() => setFilter('favorites')}
          size="sm"
          className={filter === 'favorites' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}
        >
          ⭐ Favoriler ({stats.favorites})
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              onClick={() => setFilter(key as any)}
              size="sm"
              className={filter === key 
                ? `bg-gradient-to-r ${config.color} text-white` 
                : `border-2 ${config.textColor} hover:${config.bgColor}`
              }
            >
              <Icon className="w-4 h-4 mr-1" />
              {config.label} ({(stats as any)[key]})
            </Button>
          );
        })}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => {
          const categoryInfo = categoryConfig[note.category];
          const priorityInfo = priorityConfig[note.priority];
          const Icon = categoryInfo.icon;
          
          return (
            <div
              key={note.id}
              className={`${categoryInfo.bgColor} rounded-xl p-6 shadow-lg border-2 border-opacity-20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-gradient-to-br ${categoryInfo.color} rounded-full flex items-center justify-center mr-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.textColor} ${categoryInfo.bgColor}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleFavorite(note.id)}
                    className={`p-2 rounded-full transition-colors ${
                      note.isFavorite
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(note)}
                    className="text-gray-600 hover:text-gray-800"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(note)}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>

              {/* Note Content */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed line-clamp-4">
                  {note.content}
                </p>
              </div>

              {/* Note Footer */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Oluşturuldu: {formatDate(note.createdAt)}</span>
                  <span>Güncellendi: {formatDate(note.updatedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">
            {filter === 'favorites' ? '⭐' : currentAnimal.emoji}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {filter === 'all' 
              ? 'Henüz not yok' 
              : filter === 'favorites'
              ? 'Henüz favori not yok'
              : `${categoryConfig[filter as keyof typeof categoryConfig]?.label} kategorisinde not yok`
            }
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            {filter === 'all' 
              ? 'İlk notunu ekleyerek başla ve düşüncelerini kaydet!'
              : filter === 'favorites'
              ? 'Beğendiğin notları favorilere ekle!'
              : 'Bu kategoride yeni notlar oluştur!'
            }
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAdd}
            size="lg"
            className="bg-gradient-to-r from-ormen-500 to-ormen-600 hover:from-ormen-600 hover:to-ormen-700"
          >
            İlk Notunu Oluştur
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
          setSelectedNote(null);
        }}
        title={showEditModal ? 'Not Düzenle' : 'Yeni Not Oluştur'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-6">
              <Input
                label="Not Başlığı *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notunuza bir başlık verin..."
                required
                fullWidth
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Note['category'] })}
                    required
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Öncelik *
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Note['priority'] })}
                    required
                  >
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Not İçeriği *
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Düşüncelerinizi, fikirlerinizi, hedeflerinizi buraya yazın..."
                  required
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                setSelectedNote(null);
              }}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={Save}
              className="bg-gradient-to-r from-ormen-500 to-ormen-600 hover:from-ormen-600 hover:to-ormen-700"
            >
              {showEditModal ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};