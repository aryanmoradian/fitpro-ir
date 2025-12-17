
import React, { useState } from 'react';
import { FoodItem, UserProfile } from '../types';
import { searchFoods, createCustomFood } from '../services/nutritionDatabase';
import { Search, Plus, X, User, Save, Trash2, Edit2, ArrowRight } from 'lucide-react';

interface FoodPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (food: FoodItem, amount: number) => void;
    customFoods: FoodItem[];
    profile?: UserProfile;
    updateProfile?: (p: UserProfile) => void;
}

const FoodPicker: React.FC<FoodPickerProps> = ({ isOpen, onClose, onSelect, customFoods, profile, updateProfile }) => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [amount, setAmount] = useState<number>(100);

    // Custom Food Form State
    const [newFood, setNewFood] = useState<Partial<FoodItem>>({
        name: '', unit: 'گرم', calories: 0, protein: 0, fats: 0, carbs: 0, notes: '', defaultPortion: 100
    });

    if (!isOpen) return null;

    const filteredFoods = searchFoods(searchTerm, customFoods);

    const handleAdd = () => {
        if (selectedFood) {
            onSelect(selectedFood, amount);
            onClose();
            setSelectedFood(null);
            setAmount(100);
            setSearchTerm('');
        }
    };

    const handleSaveCustomFood = () => {
        if (!newFood.name || !profile || !updateProfile) return;
        
        const foodItem = createCustomFood({
            name: newFood.name,
            unit: newFood.unit || 'گرم',
            calories: Number(newFood.calories),
            protein: Number(newFood.protein),
            fats: Number(newFood.fats),
            carbs: Number(newFood.carbs),
            defaultPortion: Number(newFood.defaultPortion) || 100,
            notes: newFood.notes,
            category: 'Custom'
        });

        updateProfile({
            ...profile,
            customFoods: [...(profile.customFoods || []), foodItem]
        });

        // Reset and switch back to list
        setNewFood({ name: '', unit: 'گرم', calories: 0, protein: 0, fats: 0, carbs: 0, notes: '', defaultPortion: 100 });
        setView('list');
        setSearchTerm(foodItem.name); // Search for the new item
    };

    const handleDeleteCustomFood = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('آیا از حذف این آیتم مطمئن هستید؟') && profile && updateProfile) {
            updateProfile({
                ...profile,
                customFoods: (profile.customFoods || []).filter(f => f.id !== id)
            });
            if (selectedFood?.id === id) setSelectedFood(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {view === 'list' ? 'مدیریت و افزودن اقلام خوراکی' : 'افزودن خوراکی جدید'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
                        <X className="text-gray-400 hover:text-white" size={24}/>
                    </button>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Search & Add Button */}
                        <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="جستجوی خوراکی..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-600 rounded-xl py-3 px-4 pr-10 text-white focus:border-green-500 outline-none"
                                    autoFocus
                                />
                                <Search className="absolute right-3 top-3.5 text-gray-500" size={18}/>
                            </div>
                            <button 
                                onClick={() => setView('create')}
                                className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl flex items-center font-bold text-sm whitespace-nowrap"
                            >
                                <Plus size={18} className="ml-1"/> افزودن خوراکی جدید
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {filteredFoods.map(food => (
                                <div 
                                    key={food.id} 
                                    onClick={() => { setSelectedFood(food); setAmount(food.defaultPortion); }}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all mb-2 flex justify-between items-center group ${selectedFood?.id === food.id ? 'bg-green-900/30 border-green-500' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                                >
                                    <div>
                                        <div className="text-white font-bold text-sm flex items-center">
                                            {food.name}
                                            {food.isCustom && <User className="w-3 h-3 text-purple-400 mr-2" />}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 flex gap-2">
                                            <span>{food.calories} کالری</span>
                                            <span className="text-blue-300">P:{food.protein}</span>
                                            <span className="text-green-300">C:{food.carbs}</span>
                                            <span className="text-yellow-300">F:{food.fats}</span>
                                            <span className="text-gray-500">({food.unit})</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {food.isCustom && (
                                            <button onClick={(e) => handleDeleteCustomFood(food.id, e)} className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                        {selectedFood?.id === food.id && <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>}
                                    </div>
                                </div>
                            ))}
                            {filteredFoods.length === 0 && (
                                <div className="text-center text-gray-500 mt-10">موردی یافت نشد.</div>
                            )}
                        </div>

                        {/* Action Area */}
                        {selectedFood && (
                            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-300">مقدار ({selectedFood.unit}):</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={amount} 
                                            onChange={e => setAmount(Number(e.target.value))}
                                            className="w-24 bg-black/40 border border-gray-600 rounded-lg p-2 text-center text-white focus:border-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-4 px-2 bg-black/20 p-2 rounded-lg">
                                    <span>کالری: {Math.round(selectedFood.calories * (amount / selectedFood.defaultPortion))}</span>
                                    <span className="text-blue-300">P: {Math.round(selectedFood.protein * (amount / selectedFood.defaultPortion))}</span>
                                    <span className="text-green-300">C: {Math.round(selectedFood.carbs * (amount / selectedFood.defaultPortion))}</span>
                                    <span className="text-yellow-300">F: {Math.round(selectedFood.fats * (amount / selectedFood.defaultPortion))}</span>
                                </div>
                                <button onClick={handleAdd} className="w-full btn-primary py-3 font-bold rounded-xl flex items-center justify-center">
                                    <Plus size={18} className="ml-2"/> افزودن به وعده
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // --- CREATE CUSTOM FOOD VIEW ---
                    <div className="flex-1 flex flex-col bg-[#0F172A]">
                        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                            <button onClick={() => setView('list')} className="text-gray-400 hover:text-white p-1"><ArrowRight/></button>
                            <span className="text-sm text-gray-400">بازگشت به لیست</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">نام خوراکی <span className="text-red-500">*</span></label>
                                <input value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="w-full input-styled p-3" placeholder="مثلا: پروتئین بار خانگی"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">واحد <span className="text-red-500">*</span></label>
                                    <input value={newFood.unit} onChange={e => setNewFood({...newFood, unit: e.target.value})} className="w-full input-styled p-3" placeholder="گرم / عدد"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">مقدار پیش‌فرض</label>
                                    <input type="number" value={newFood.defaultPortion} onChange={e => setNewFood({...newFood, defaultPortion: Number(e.target.value)})} className="w-full input-styled p-3"/>
                                </div>
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-sm font-bold text-gray-300 mb-3 text-center">ارزش غذایی (در مقدار پیش‌فرض)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1 text-center">کالری</label>
                                        <input type="number" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: Number(e.target.value)})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-blue-400 block mb-1 text-center">پروتئین (g)</label>
                                        <input type="number" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: Number(e.target.value)})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-green-400 block mb-1 text-center">کربوهیدرات (g)</label>
                                        <input type="number" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: Number(e.target.value)})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-yellow-400 block mb-1 text-center">چربی (g)</label>
                                        <input type="number" value={newFood.fats} onChange={e => setNewFood({...newFood, fats: Number(e.target.value)})} className="w-full input-styled p-2 text-center"/>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">توضیحات / منبع</label>
                                <textarea value={newFood.notes} onChange={e => setNewFood({...newFood, notes: e.target.value})} className="w-full input-styled p-3 h-24 resize-none" placeholder="یادداشت اختیاری..." />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-gray-900 flex gap-3">
                            <button onClick={() => setView('list')} className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-600 transition">انصراف</button>
                            <button onClick={handleSaveCustomFood} disabled={!newFood.name} className="flex-[2] btn-primary py-3 rounded-xl font-bold shadow-lg disabled:opacity-50">
                                <Save size={18} className="inline ml-2"/> ذخیره در لیست شخصی
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodPicker;
