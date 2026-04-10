import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Grid,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

const MenuEditor: React.FC = () => {
  const { businessProfile, updateBusinessServices } = useApp();
  const [services, setServices] = useState<any[]>(businessProfile?.customServices || (businessProfile as any)?.services || []);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: 0, avgTime: 15, category: 'General' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const categories = Array.from(new Set(services.map(s => s.category || 'General')));

  const handleAddService = () => {
    const s = { ...newService, id: Date.now().toString() };
    const updated = [...services, s];
    setServices(updated);
    setShowAddModal(false);
    setNewService({ name: '', price: 0, avgTime: 15, category: 'General' });
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleUpdateService = (id: string, updates: any) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
    setIsEditing(null);
  };

  const handleSaveAll = async () => {
    setSaveStatus('saving');
    await updateBusinessServices(services);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  if (!businessProfile) return null;

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-10 pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-4">
              <Grid className="text-primary" size={32} />
              Service Menu Editor
            </h1>
            <p className="text-text-dim mt-2 font-medium">Customize your services, pricing, and durations.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
          >
            <Plus size={24} /> Add New Service
          </motion.button>
        </div>

        {/* Categories & Items */}
        <div className="space-y-12">
          {categories.map(cat => (
            <div key={cat} className="space-y-6">
              <h3 className="text-xl font-black text-text-dim uppercase tracking-[0.2em] flex items-center gap-3 border-l-4 border-primary pl-4">
                {cat}
              </h3>
              <div className="grid gap-4">
                {services.filter(s => (s.category || 'General') === cat).map(service => (
                  <motion.div
                    layout
                    key={service.id}
                    className="bg-surface border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl shadow-black/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-text">{service.name}</span>
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-text-dim uppercase tracking-widest border border-white/5">
                          ID: {service.id.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <DollarSign size={16} />
                          <span>{service.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-dim">
                          <Clock size={16} />
                          <span>{service.avgTime} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setIsEditing(service.id)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-text-dim hover:text-text transition-all"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6">
          <div className="bg-surface/80 backdrop-blur-3xl border border-white/10 p-4 rounded-[32px] shadow-2xl flex items-center justify-between ring-1 ring-white/20">
            <div className="flex items-center gap-4 ml-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-dim">
                <Info size={20} />
              </div>
              <p className="text-sm font-bold text-text-dim">{services.length} services listed</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAll}
              disabled={saveStatus === 'saving'}
              className={`px-8 py-3 rounded-2xl font-black text-white flex items-center gap-3 transition-all ${
                saveStatus === 'saved' ? 'bg-green-500' : 'bg-primary shadow-xl shadow-primary/20'
              }`}
            >
              {saveStatus === 'saving' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 size={20} /> Published
                </>
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-surface border border-white/10 rounded-[40px] p-10 overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-text">New Service</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-text-dim hover:text-text"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 block">Service Name</label>
                    <input 
                      type="text" 
                      value={newService.name}
                      onChange={e => setNewService({...newService, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-text font-bold focus:border-primary outline-none transition-all"
                      placeholder="e.g. Premium Haircut"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 block">Price (₹)</label>
                      <input 
                        type="number" 
                        value={newService.price}
                        onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-text font-bold focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 block">Time (Min)</label>
                      <input 
                        type="number" 
                        value={newService.avgTime}
                        onChange={e => setNewService({...newService, avgTime: Number(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-text font-bold focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 block">Category</label>
                    <select 
                      value={newService.category}
                      onChange={e => setNewService({...newService, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-text font-bold focus:border-primary outline-none transition-all appearance-none"
                    >
                      <option value="General">General</option>
                      <option value="Premium">Premium</option>
                      <option value="Express">Express</option>
                      <option value="Add-on">Add-on</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleAddService}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 mt-4"
                  >
                    Confirm & Add
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MenuEditor;
