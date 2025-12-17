
import React, { useState } from 'react';
import { FoodItem, WeeklyNutritionPlan, DailyMealPlan, MealEntry, UserProfile } from '../types';
import { Plus, Trash2, Save, Coffee, Sun, Moon, Apple, ChevronRight, ChevronLeft } from 'lucide-react';
import { CENTRAL_FOOD_DB } from '../services/nutritionDatabase';
import FoodPicker from './FoodPicker';

interface NutritionBuilderProps {
  currentPlan: WeeklyNutritionPlan;
  updatePlan: (plan: WeeklyNutritionPlan) => void;
  profile?: UserProfile;
  updateProfile?: (profile: UserProfile) => void;
}

const NutritionBuilder: React.FC<NutritionBuilderProps> = ({ currentPlan, updatePlan, profile, updateProfile }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast'|'lunch'|'dinner'|'snacks' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helpers
  const getDailyPlan = (day: number) => {
    let dayPlan = currentPlan.days.find(d => d.dayOfWeek === day);
    if (!dayPlan) {
      dayPlan = { dayOfWeek: day, breakfast: [], lunch: [], dinner: [], snacks: [] };
    }
    return dayPlan;
  };

  const updateDailyPlan = (updatedDay: DailyMealPlan) => {
    const existingIndex = currentPlan.days.findIndex(d => d.dayOfWeek === updatedDay.dayOfWeek);
    let newDays = [...currentPlan.days];
    if (existingIndex >= 0) {
      newDays[existingIndex] = updatedDay;
    } else {
      newDays.push(updatedDay);
    }
    updatePlan({ ...currentPlan, days: newDays });
  };

  const addFoodToMeal = (food: FoodItem, amount: number) => {
    if (!selectedMealType) return;
    const dayPlan = getDailyPlan(activeDay);
    
    // Logic to calculate macros based on portion relative to default
    const ratio = amount / (food.defaultPortion || 100);

    const newEntry: MealEntry = {
      id: Date.now().toString(),
      foodId: food.id,
      name: food.name,
      amount: amount,
      macros: {
        calories: Math.round(food.calories * ratio),
        protein: Math.round(food.protein * ratio),
        carbs: Math.round(food.carbs * ratio),
        fats: Math.round(food.fats * ratio),
      }
    };

    const updatedDay = {
      ...dayPlan,
      [selectedMealType]: [...dayPlan[selectedMealType], newEntry]
    };
    updateDailyPlan(updatedDay);
    setIsModalOpen(false);
  };

  const removeFoodFromMeal = (mealType: 'breakfast'|'lunch'|'dinner'|'snacks', entryId: string) => {
    const dayPlan = getDailyPlan(activeDay);
    const updatedDay = {
      ...dayPlan,
      [mealType]: dayPlan[mealType].filter(e => e.id !== entryId)
    };
    updateDailyPlan(updatedDay);
  };

  const calculateTotalMacros = (dayPlan: DailyMealPlan) => {
    let total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const meals: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
    meals.forEach(meal => {
      (dayPlan[meal] || []).forEach((entry: MealEntry) => { 
        total.calories += entry.macros.calories;
        total.protein += entry.macros.protein;
        total.carbs += entry.macros.carbs;
        total.fats += entry.macros.fats;
      });
    });
    return total;
  };

  const dayPlan = getDailyPlan(activeDay);
  const totals = calculateTotalMacros(dayPlan);

  const MealSection = ({ title, type, items, icon: Icon }: any) => (
    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
        <h4 className="font-bold text-white flex items-center text-sm">
          <Icon className="w-4 h-4 ml-2 opacity-70" /> {title}
        </h4>
        <button 
          onClick={() => { setSelectedMealType(type); setIsModalOpen(true); }}
          className="bg-green-600/20 text-green-400 hover:bg-green-600/40 p-1 rounded transition"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
           <div className="text-xs text-gray-600 text-center py-2">خالی</div>
        ) : (
           items.map((item: MealEntry) => (
             <div key={item.id} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
               <div>
                 <span className="text-gray-200">{item.name}</span>
                 <span className="text-gray-500 mr-2">({item.amount} {item.amount > 20 ? 'g' : 'unit'})</span>
               </div>
               <div className="flex items-center">
                 <span className="text-orange-300 ml-3">{item.macros.calories} kcal</span>
                 <button onClick={() => removeFoodFromMeal(type, item.id)} className="text-red-400 hover:text-red-300">
                   <Trash2 size={12} />
                 </button>
               </div>
             </div>
           ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4 relative">
      {/* 1. Day Navigation */}
      <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/10">
        <button 
          onClick={() => setActiveDay(prev => Math.max(1, prev - 1))}
          disabled={activeDay === 1}
          className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
        >
          <ChevronRight />
        </button>
        <span className="font-bold text-white">برنامه روز {activeDay}</span>
        <button 
          onClick={() => setActiveDay(prev => Math.min(7, prev + 1))}
          disabled={activeDay === 7}
          className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
        >
          <ChevronLeft />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar">
         <MealSection title="صبحانه" type="breakfast" items={dayPlan.breakfast} icon={Coffee} />
         <MealSection title="ناهار" type="lunch" items={dayPlan.lunch} icon={Sun} />
         <MealSection title="شام" type="dinner" items={dayPlan.dinner} icon={Moon} />
         <MealSection title="میان وعده" type="snacks" items={dayPlan.snacks} icon={Apple} />
      </div>

      {/* 2. Macro Summary Footer */}
      <div className="energetic-card p-4 flex justify-between items-center shadow-lg mt-auto">
         <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-center px-4 border-l border-white/10">
               <div className="text-sm text-gray-400">کالری کل</div>
               <div className="text-2xl font-bold text-white">{totals.calories}</div>
            </div>
            <div className="text-center hidden md:block">
               <div className="text-sm text-blue-400">پروتئین</div>
               <div className="text-lg font-bold text-white">{totals.protein}g</div>
            </div>
            <div className="text-center hidden md:block">
               <div className="text-sm text-green-400">کربوهیدرات</div>
               <div className="text-lg font-bold text-white">{totals.carbs}g</div>
            </div>
            <div className="text-center hidden md:block">
               <div className="text-sm text-yellow-400">چربی</div>
               <div className="text-lg font-bold text-white">{totals.fats}g</div>
            </div>
         </div>
         <button className="flex items-center btn-primary shadow transition text-sm px-4 py-2">
            <Save size={18} className="ml-2" /> ذخیره
         </button>
      </div>

      {/* 3. Add Food Modal (Enhanced FoodPicker) */}
      <FoodPicker 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={addFoodToMeal} 
        customFoods={profile?.customFoods || []}
        profile={profile}
        updateProfile={updateProfile}
      />
    </div>
  );
};

export default NutritionBuilder;
