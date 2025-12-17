
import React, { useState } from 'react';
import { EXERCISE_DB } from '../services/exerciseDatabase';
import { ExerciseDef, MuscleGroup, Equipment, Difficulty, UserProfile } from '../types';
import { Search, Filter, Plus, X, User, Edit2, Trash2, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { UI_STRINGS } from '../lib/uiTranslations';

interface ExercisePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exerciseId: string) => void;
    profile?: UserProfile;
    updateProfile?: (p: UserProfile) => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({ isOpen, onClose, onSelect, profile, updateProfile }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'All'>('All');
    const [filterEquipment, setFilterEquipment] = useState<Equipment | 'All'>('All');
    const [showPersian, setShowPersian] = useState(true);

    // Editor State
    const [editingExercise, setEditingExercise] = useState<Partial<ExerciseDef>>({
        name_en: '', name_fa: '', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', 
        description: '', defaults: { sets: 3, reps: '10-12', rest: 60 }
    });

    if (!isOpen) return null;

    const customExercises = profile?.customExercises || [];
    const displayedList = activeTab === 'library' ? EXERCISE_DB : customExercises;

    const filtered = displayedList.filter(ex => {
        const matchesSearch = ex.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ex.name_fa.includes(searchTerm);
        const matchesMuscle = filterMuscle === 'All' || ex.muscle === filterMuscle;
        const matchesEquipment = filterEquipment === 'All' || ex.equipment === filterEquipment;
        return matchesSearch && matchesMuscle && matchesEquipment;
    });

    const muscles: (MuscleGroup | 'All')[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Full Body', 'Glutes', 'Calves', 'Forearms'];
    const equipments: (Equipment | 'All')[] = ['All', 'Barbell', 'Dumbbell', 'Machine', 'Cables', 'Bodyweight', 'Bands', 'Smith Machine', 'TRX'];

    // --- ACTIONS ---

    const handleCreateNew = () => {
        setEditingExercise({
            name_en: '', name_fa: '', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', 
            description: '', defaults: { sets: 3, reps: '10-12', rest: 60 }
        });
        setView('editor');
    };

    const handleEdit = (ex: ExerciseDef) => {
        setEditingExercise({ ...ex });
        setView('editor');
    };

    const handleDelete = (id: string) => {
        if (confirm(UI_STRINGS.errors.deleteConfirmation) && updateProfile && profile) {
            const updated = customExercises.filter(ex => ex.id !== id);
            updateProfile({ ...profile, customExercises: updated });
        }
    };

    const handleSave = () => {
        if (!editingExercise.name_fa || !updateProfile || !profile) return alert(UI_STRINGS.errors.requiredField);
        
        const newEx: ExerciseDef = {
            id: editingExercise.id || `cust_${Date.now()}`,
            name_en: editingExercise.name_en || editingExercise.name_fa,
            name_fa: editingExercise.name_fa,
            muscle: editingExercise.muscle as MuscleGroup,
            equipment: editingExercise.equipment as Equipment,
            difficulty: editingExercise.difficulty as Difficulty,
            description: editingExercise.description || '',
            pattern: 'Isolation', // Default
            type: 'Isolation', // Default
            isCustom: true,
            defaults: editingExercise.defaults
        };

        let updatedCustoms;
        if (editingExercise.id) {
            updatedCustoms = customExercises.map(c => c.id === newEx.id ? newEx : c);
        } else {
            updatedCustoms = [...customExercises, newEx];
        }

        updateProfile({ ...profile, customExercises: updatedCustoms });
        setView('list');
        setActiveTab('custom');
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="text-blue-400" size={20}/> {UI_STRINGS.labels.modalTitle}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
                        <X className="text-gray-400 hover:text-white" size={24}/>
                    </button>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Control Bar */}
                        <div className="p-4 bg-gray-900 flex flex-col md:flex-row gap-4 border-b border-gray-700">
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 w-fit">
                                <button 
                                    onClick={() => setActiveTab('library')}
                                    className={`px-4 py-2 rounded-md text-xs font-bold transition ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {UI_STRINGS.labels.tabLibrary}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('custom')}
                                    className={`px-4 py-2 rounded-md text-xs font-bold transition ${activeTab === 'custom' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {UI_STRINGS.labels.tabCustom}
                                </button>
                            </div>
                            
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    placeholder={UI_STRINGS.actions.search} 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-600 rounded-xl py-2 px-4 pr-10 text-white focus:border-blue-500 outline-none text-sm h-full"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-500" size={18}/>
                            </div>

                            <button onClick={handleCreateNew} className="btn-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center whitespace-nowrap">
                                <Plus size={16} className="ml-1"/> {UI_STRINGS.actions.create}
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800/50 flex gap-2 overflow-x-auto custom-scrollbar">
                            <select 
                                value={filterMuscle} 
                                onChange={(e) => setFilterMuscle(e.target.value as any)}
                                className="bg-black/30 border border-gray-600 rounded-lg py-1 px-3 text-white focus:border-blue-500 outline-none text-xs"
                            >
                                {muscles.map(m => <option key={m} value={m}>{m === 'All' ? 'همه عضلات' : m}</option>)}
                            </select>
                            <select 
                                value={filterEquipment} 
                                onChange={(e) => setFilterEquipment(e.target.value as any)}
                                className="bg-black/30 border border-gray-600 rounded-lg py-1 px-3 text-white focus:border-blue-500 outline-none text-xs"
                            >
                                {equipments.map(e => <option key={e} value={e}>{e === 'All' ? 'همه تجهیزات' : e}</option>)}
                            </select>
                            <div className="flex items-center gap-2 mr-auto">
                                <span className="text-xs text-gray-400">FA / EN</span>
                                <button 
                                    onClick={() => setShowPersian(!showPersian)}
                                    className={`w-8 h-4 rounded-full relative transition ${showPersian ? 'bg-green-600' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showPersian ? 'left-0.5' : 'right-0.5'}`}></div>
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filtered.map(ex => (
                                    <div key={ex.id} className="bg-gray-800/50 hover:bg-gray-800 border border-white/5 hover:border-blue-500/50 rounded-xl p-3 transition-all group flex flex-col relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{showPersian ? ex.name_fa : ex.name_en}</h4>
                                                <span className="text-[10px] text-gray-500 block">{!showPersian ? ex.name_fa : ex.name_en}</span>
                                            </div>
                                            {ex.isCustom && <User className="w-4 h-4 text-purple-400" />}
                                        </div>
                                        
                                        <div className="flex gap-1 mb-2">
                                            <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded">{ex.muscle}</span>
                                            <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">{ex.equipment}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                            <button 
                                                onClick={() => onSelect(ex.id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition shadow-lg shadow-blue-900/20 flex-1 justify-center"
                                            >
                                                {UI_STRINGS.actions.select}
                                            </button>
                                            
                                            {ex.isCustom && (
                                                <div className="flex gap-1 mr-2">
                                                    <button onClick={() => handleEdit(ex)} className="p-1.5 hover:bg-yellow-900/30 text-gray-400 hover:text-yellow-400 rounded"><Edit2 size={14}/></button>
                                                    <button onClick={() => handleDelete(ex.id)} className="p-1.5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filtered.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    <p>{UI_STRINGS.emptyStates.noResults}</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // --- EDITOR VIEW ---
                    <div className="flex-1 flex flex-col bg-[#0F172A]">
                        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                            <button onClick={() => setView('list')} className="text-gray-400 hover:text-white p-1"><ArrowRight/></button>
                            <h3 className="font-bold text-white">{editingExercise.id ? 'ویرایش حرکت' : UI_STRINGS.labels.tabCustom}</h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.movementNameFa} <span className="text-red-500">*</span></label>
                                    <input value={editingExercise.name_fa} onChange={e => setEditingExercise({...editingExercise, name_fa: e.target.value})} className="w-full input-styled p-3" dir="rtl"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.movementNameEn}</label>
                                    <input value={editingExercise.name_en} onChange={e => setEditingExercise({...editingExercise, name_en: e.target.value})} className="w-full input-styled p-3" dir="ltr"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.category}</label>
                                    <select value={editingExercise.muscle} onChange={e => setEditingExercise({...editingExercise, muscle: e.target.value as any})} className="w-full input-styled p-3">
                                        {muscles.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.equipment}</label>
                                    <select value={editingExercise.equipment} onChange={e => setEditingExercise({...editingExercise, equipment: e.target.value as any})} className="w-full input-styled p-3">
                                        {equipments.filter(e => e !== 'All').map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.difficulty}</label>
                                    <select value={editingExercise.difficulty} onChange={e => setEditingExercise({...editingExercise, difficulty: e.target.value as any})} className="w-full input-styled p-3">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-sm font-bold text-gray-300 mb-3">{UI_STRINGS.labels.defaults}</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1 text-center">{UI_STRINGS.labels.sets}</label>
                                        <input type="number" value={editingExercise.defaults?.sets} onChange={e => setEditingExercise({...editingExercise, defaults: {...editingExercise.defaults!, sets: +e.target.value}})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1 text-center">{UI_STRINGS.labels.reps}</label>
                                        <input value={editingExercise.defaults?.reps} onChange={e => setEditingExercise({...editingExercise, defaults: {...editingExercise.defaults!, reps: e.target.value}})} className="w-full input-styled p-2 text-center" dir="ltr"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1 text-center">{UI_STRINGS.labels.rest}</label>
                                        <input type="number" value={editingExercise.defaults?.rest} onChange={e => setEditingExercise({...editingExercise, defaults: {...editingExercise.defaults!, rest: +e.target.value}})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.notes}</label>
                                <textarea value={editingExercise.description} onChange={e => setEditingExercise({...editingExercise, description: e.target.value})} className="w-full input-styled p-3 h-24 resize-none" />
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">{UI_STRINGS.labels.videoUrl}</label>
                                <input value={editingExercise.videoUrl || ''} onChange={e => setEditingExercise({...editingExercise, videoUrl: e.target.value})} className="w-full input-styled p-3" dir="ltr" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900">
                            <button onClick={() => setView('list')} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition">{UI_STRINGS.actions.cancel}</button>
                            <button onClick={handleSave} className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg flex items-center">
                                <Save size={18} className="ml-2"/> {UI_STRINGS.actions.save}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExercisePicker;
