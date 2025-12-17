
import { FoodItem } from '../types';

// Central Database of Foods (Translated to Persian)
export const CENTRAL_FOOD_DB: FoodItem[] = [
    // PROTEIN
    { id: 'f_p1', name: 'سینه مرغ (گریل)', calories: 165, protein: 31, carbs: 0, fats: 3.6, unit: '100g', defaultPortion: 100, category: 'Protein' },
    { id: 'f_p2', name: 'تخم مرغ (آبپز کامل)', calories: 155, protein: 13, carbs: 1.1, fats: 11, unit: 'عدد', defaultPortion: 1, category: 'Protein' },
    { id: 'f_p3', name: 'ماهی سالمون (خام)', calories: 208, protein: 20, carbs: 0, fats: 13, unit: '100g', defaultPortion: 100, category: 'Protein' },
    { id: 'f_p4', name: 'پودر پروتئین وی', calories: 120, protein: 24, carbs: 3, fats: 1, unit: 'اسکوپ', defaultPortion: 1, category: 'Protein' },
    { id: 'f_p5', name: 'تن ماهی (در آب)', calories: 116, protein: 26, carbs: 0, fats: 1, unit: 'قوطی', defaultPortion: 1, category: 'Protein' },
    { id: 'f_p6', name: 'گوشت گوساله (کم چرب)', calories: 250, protein: 26, carbs: 0, fats: 15, unit: '100g', defaultPortion: 100, category: 'Protein' },
    
    // CARBS
    { id: 'f_c1', name: 'برنج سفید (پخته)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, unit: '100g', defaultPortion: 100, category: 'Carbs' },
    { id: 'f_c2', name: 'جو دوسر (پرک)', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, unit: '100g', defaultPortion: 50, category: 'Carbs' },
    { id: 'f_c3', name: 'سیب زمینی شیرین (پخته)', calories: 90, protein: 2, carbs: 21, fats: 0.1, unit: '100g', defaultPortion: 150, category: 'Carbs' },
    { id: 'f_c4', name: 'موز', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, unit: 'عدد متوسط', defaultPortion: 1, category: 'Fruits' },
    { id: 'f_c5', name: 'سیب', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, unit: 'عدد متوسط', defaultPortion: 1, category: 'Fruits' },
    { id: 'f_c6', name: 'ماکارونی (پخته)', calories: 131, protein: 5, carbs: 25, fats: 1, unit: '100g', defaultPortion: 100, category: 'Carbs' },
    { id: 'f_c7', name: 'نان لواش', calories: 290, protein: 9, carbs: 56, fats: 2, unit: '100g', defaultPortion: 50, category: 'Carbs' },

    // FATS
    { id: 'f_f1', name: 'بادام درختی', calories: 579, protein: 21, carbs: 22, fats: 50, unit: '100g', defaultPortion: 30, category: 'Fats' },
    { id: 'f_f2', name: 'آووکادو', calories: 160, protein: 2, carbs: 9, fats: 15, unit: 'عدد متوسط', defaultPortion: 0.5, category: 'Fats' },
    { id: 'f_f3', name: 'روغن زیتون', calories: 884, protein: 0, carbs: 0, fats: 100, unit: 'قاشق غذاخوری', defaultPortion: 1, category: 'Fats' },
    { id: 'f_f4', name: 'کره بادام زمینی', calories: 588, protein: 25, carbs: 20, fats: 50, unit: 'قاشق غذاخوری', defaultPortion: 1, category: 'Fats' },
    { id: 'f_f5', name: 'گردو', calories: 654, protein: 15, carbs: 14, fats: 65, unit: '100g', defaultPortion: 30, category: 'Fats' },
];

export const searchFoods = (query: string, userCustomFoods: FoodItem[] = []): FoodItem[] => {
    const allFoods = [...userCustomFoods, ...CENTRAL_FOOD_DB];
    if (!query) return allFoods;
    
    const lowerQuery = query.toLowerCase();
    return allFoods.filter(f => f.name.toLowerCase().includes(lowerQuery));
};

export const createCustomFood = (food: Omit<FoodItem, 'id' | 'isCustom'>): FoodItem => {
    return {
        id: `cust_${Date.now()}`,
        ...food,
        isCustom: true
    };
};
