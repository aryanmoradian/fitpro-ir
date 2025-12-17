
import { ExerciseDef, Equipment, Difficulty, MuscleGroup } from '../types';

export const EXERCISE_DB: ExerciseDef[] = [
    // --- CHEST ---
    { id: 'bp_bb', name_en: 'Barbell Bench Press', name_fa: 'پرس سینه هالتر', muscle: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Horizontal', description: 'حرکت مادر برای حجم و قدرت سینه.' },
    { id: 'bp_db', name_en: 'Dumbbell Bench Press', name_fa: 'پرس سینه دمبل', muscle: 'Chest', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Compound', pattern: 'Push_Horizontal', description: 'دامنه حرکتی بیشتر نسبت به هالتر.' },
    { id: 'inc_bp_bb', name_en: 'Incline Barbell Press', name_fa: 'بالا سینه هالتر', muscle: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Horizontal', description: 'تمرکز روی بخش بالایی سینه.' },
    { id: 'inc_bp_db', name_en: 'Incline Dumbbell Press', name_fa: 'بالا سینه دمبل', muscle: 'Chest', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Compound', pattern: 'Push_Horizontal', description: 'ایزوله کردن بخش بالایی سینه.' },
    { id: 'dec_bp_bb', name_en: 'Decline Barbell Press', name_fa: 'زیر سینه هالتر', muscle: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Horizontal', description: 'تمرکز روی بخش پایینی سینه.' },
    { id: 'pushup', name_en: 'Push Up', name_fa: 'شنا سوئدی', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', type: 'Compound', pattern: 'Push_Horizontal', description: 'حرکت وزن بدن کلاسیک.' },
    { id: 'dips_chest', name_en: 'Chest Dips', name_fa: 'پارالل سینه', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Advanced', type: 'Compound', pattern: 'Push_Vertical', description: 'عالی برای زیر سینه و پشت بازو.' },
    { id: 'cable_fly_high', name_en: 'Cable Crossover (High)', name_fa: 'کراس اور (بالا به پایین)', muscle: 'Chest', equipment: 'Cables', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Push_Horizontal', description: 'فشار روی بخش پایینی و داخلی سینه.' },
    { id: 'cable_fly_low', name_en: 'Cable Crossover (Low)', name_fa: 'کراس اور (پایین به بالا)', muscle: 'Chest', equipment: 'Cables', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Push_Horizontal', description: 'فشار روی بخش بالایی سینه.' },
    { id: 'pec_deck', name_en: 'Pec Deck Machine', name_fa: 'دستگاه قفسه سینه (پک دک)', muscle: 'Chest', equipment: 'Machine', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Horizontal', description: 'ایزوله کامل سینه بدون دخالت عضلات ثبات دهنده.' },
    { id: 'db_fly', name_en: 'Dumbbell Fly', name_fa: 'قفسه سینه دمبل', muscle: 'Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Push_Horizontal', description: 'کشش عالی برای الیاف سینه.' },

    // --- BACK ---
    { id: 'deadlift', name_en: 'Deadlift', name_fa: 'ددلیفت', muscle: 'Back', equipment: 'Barbell', difficulty: 'Advanced', type: 'Compound', pattern: 'Hinge', description: 'پادشاه حرکات برای کل زنجیره پشتی.' },
    { id: 'pullup', name_en: 'Pull Up', name_fa: 'بارفیکس', muscle: 'Back', equipment: 'Bodyweight', difficulty: 'Advanced', type: 'Compound', pattern: 'Pull_Vertical', description: 'بهترین حرکت برای پهنای پشت.' },
    { id: 'lat_pulldown', name_en: 'Lat Pulldown', name_fa: 'زیربغل سیم‌کش', muscle: 'Back', equipment: 'Machine', difficulty: 'Beginner', type: 'Compound', pattern: 'Pull_Vertical', description: 'جایگزین عالی برای بارفیکس.' },
    { id: 'bb_row', name_en: 'Barbell Row', name_fa: 'زیربغل هالتر خم', muscle: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Pull_Horizontal', description: 'عالی برای ضخامت پشت.' },
    { id: 'db_row', name_en: 'One Arm Dumbbell Row', name_fa: 'زیربغل دمبل تک خم', muscle: 'Back', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Compound', pattern: 'Pull_Horizontal', description: 'تمرکز روی لَت‌ها به صورت تک دست.' },
    { id: 'cable_row', name_en: 'Seated Cable Row', name_fa: 'زیربغل قایقی', muscle: 'Back', equipment: 'Cables', difficulty: 'Beginner', type: 'Compound', pattern: 'Pull_Horizontal', description: 'فشار روی بخش میانی پشت.' },
    { id: 'tbar_row', name_en: 'T-Bar Row', name_fa: 'زیربغل تی‌بار', muscle: 'Back', equipment: 'Machine', difficulty: 'Intermediate', type: 'Compound', pattern: 'Pull_Horizontal', description: 'حرکت قدرتی برای ضخامت.' },
    { id: 'lat_pullover', name_en: 'Cable Pullover', name_fa: 'پلاور سیم‌کش', muscle: 'Back', equipment: 'Cables', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Pull_Vertical', description: 'ایزوله کردن عضلات لَت.' },
    { id: 'shrug_bb', name_en: 'Barbell Shrug', name_fa: 'شراگ هالتر', muscle: 'Back', secondary_muscles: ['Shoulders'], equipment: 'Barbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Vertical', description: 'مخصوص عضلات کول.' },
    { id: 'back_ext', name_en: 'Back Extension', name_fa: 'فیله کمر', muscle: 'Back', equipment: 'Bodyweight', difficulty: 'Beginner', type: 'Isolation', pattern: 'Hinge', description: 'تقویت کننده پایین کمر.' },

    // --- LEGS ---
    { id: 'squat_bb', name_en: 'Barbell Back Squat', name_fa: 'اسکات هالتر', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', type: 'Compound', pattern: 'Squat', description: 'مهمترین حرکت برای پایین تنه.' },
    { id: 'front_squat', name_en: 'Front Squat', name_fa: 'اسکات از جلو', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', type: 'Compound', pattern: 'Squat', description: 'تمرکز بیشتر روی چهارسر ران.' },
    { id: 'leg_press', name_en: 'Leg Press', name_fa: 'پرس پا دستگاه', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', type: 'Compound', pattern: 'Squat', description: 'حجم دهنده عالی بدون فشار روی کمر.' },
    { id: 'goblet_squat', name_en: 'Goblet Squat', name_fa: 'اسکات گابلت', muscle: 'Legs', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Compound', pattern: 'Squat', description: 'عالی برای یادگیری فرم اسکات.' },
    { id: 'lunge_walk', name_en: 'Walking Lunge', name_fa: 'لانگز راه رفتنی', muscle: 'Legs', equipment: 'Dumbbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Lunge', description: 'تعادل و قدرت تک پا.' },
    { id: 'bulgarian_split', name_en: 'Bulgarian Split Squat', name_fa: 'اسکات بلغاری', muscle: 'Legs', equipment: 'Dumbbell', difficulty: 'Advanced', type: 'Compound', pattern: 'Lunge', description: 'قاتل عضلات پا و باسن.' },
    { id: 'rdl_bb', name_en: 'Romanian Deadlift', name_fa: 'ددلیفت رومانیایی', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Hinge', description: 'کشش و تقویت همسترینگ.' },
    { id: 'leg_curl', name_en: 'Leg Curl Machine', name_fa: 'پشت ران دستگاه', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', type: 'Isolation', pattern: 'Hinge', description: 'ایزوله کردن همسترینگ.' },
    { id: 'leg_ext', name_en: 'Leg Extension', name_fa: 'جلوران دستگاه', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', type: 'Isolation', pattern: 'Squat', description: 'ایزوله کردن چهارسر ران.' },
    { id: 'calf_raise_stand', name_en: 'Standing Calf Raise', name_fa: 'ساق پا ایستاده', muscle: 'Calves', equipment: 'Machine', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Vertical', description: 'حجم دهنده ساق.' },
    { id: 'calf_raise_seat', name_en: 'Seated Calf Raise', name_fa: 'ساق پا نشسته', muscle: 'Calves', equipment: 'Machine', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Vertical', description: 'تمرکز روی عضله نعلی ساق.' },

    // --- SHOULDERS ---
    { id: 'ohp_bb', name_en: 'Overhead Press', name_fa: 'پرس سرشانه هالتر ایستاده', muscle: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Vertical', description: 'قدرت کلی بالاتنه.' },
    { id: 'ohp_db', name_en: 'Seated Dumbbell Press', name_fa: 'پرس سرشانه دمبل نشسته', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Compound', pattern: 'Push_Vertical', description: 'کنترل بهتر و فشار متمرکز.' },
    { id: 'arnold_press', name_en: 'Arnold Press', name_fa: 'پرس آرنولدی', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Vertical', description: 'درگیری تمام بخش‌های سرشانه.' },
    { id: 'lat_raise', name_en: 'Lateral Raise', name_fa: 'نشر جانب دمبل', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Vertical', description: 'مهمترین حرکت برای پهنای شانه.' },
    { id: 'front_raise', name_en: 'Front Raise', name_fa: 'نشر جلو دمبل', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Vertical', description: 'تقویت بخش جلویی سرشانه.' },
    { id: 'rear_delt_fly', name_en: 'Rear Delt Fly', name_fa: 'نشر خم دمبل', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Horizontal', description: 'تقویت بخش پشتی سرشانه.' },
    { id: 'face_pull', name_en: 'Face Pull', name_fa: 'فیس پول', muscle: 'Shoulders', secondary_muscles: ['Back'], equipment: 'Cables', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Horizontal', description: 'اصلاح فرم شانه و تقویت بخش پشتی.' },

    // --- ARMS ---
    { id: 'curl_bb', name_en: 'Barbell Curl', name_fa: 'جلوبازو هالتر ایستاده', muscle: 'Biceps', equipment: 'Barbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Vertical', description: 'حجم کلی جلو بازو.' },
    { id: 'curl_db', name_en: 'Dumbbell Curl', name_fa: 'جلوبازو دمبل', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Vertical', description: 'تناسب و تقارن بازو.' },
    { id: 'hammer_curl', name_en: 'Hammer Curl', name_fa: 'جلوبازو چکشی', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', type: 'Isolation', pattern: 'Pull_Vertical', description: 'ضخامت بازو و ساعد.' },
    { id: 'preacher_curl', name_en: 'Preacher Curl', name_fa: 'جلوبازو لاری', muscle: 'Biceps', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Pull_Vertical', description: 'فشار متمرکز روی پیک بازو.' },
    { id: 'skull_crusher', name_en: 'Skull Crusher', name_fa: 'پشت بازو هالتر خوابیده', muscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Push_Vertical', description: 'حجم دهنده اصلی پشت بازو.' },
    { id: 'tricep_pushdown', name_en: 'Triceps Pushdown', name_fa: 'پشت بازو سیم‌کش', muscle: 'Triceps', equipment: 'Cables', difficulty: 'Beginner', type: 'Isolation', pattern: 'Push_Vertical', description: 'تفکیک و پمپاژ خون.' },
    { id: 'close_grip_bench', name_en: 'Close Grip Bench Press', name_fa: 'پرس سینه دست جمع', muscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', type: 'Compound', pattern: 'Push_Horizontal', description: 'قدرت و حجم پشت بازو.' },
    { id: 'dips_bench', name_en: 'Bench Dips', name_fa: 'دیپس روی نیمکت', muscle: 'Triceps', equipment: 'Bodyweight', difficulty: 'Beginner', type: 'Compound', pattern: 'Push_Vertical', description: 'حرکت وزن بدن ساده برای پشت بازو.' },

    // --- CORE ---
    { id: 'plank', name_en: 'Plank', name_fa: 'پلانک', muscle: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner', type: 'Isolation', pattern: 'Core', description: 'ثبات میان‌تنه.' },
    { id: 'leg_raise', name_en: 'Hanging Leg Raise', name_fa: 'زیرشکم خلبانی', muscle: 'Core', equipment: 'Bodyweight', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Core', description: 'تمرکز روی بخش پایینی شکم.' },
    { id: 'crunch_cable', name_en: 'Cable Crunch', name_fa: 'کرانچ سیم‌کش', muscle: 'Core', equipment: 'Cables', difficulty: 'Intermediate', type: 'Isolation', pattern: 'Core', description: 'ساخت عضلات شکم با وزنه.' },
    { id: 'russian_twist', name_en: 'Russian Twist', name_fa: 'چرخش روسی', muscle: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner', type: 'Isolation', pattern: 'Core', description: 'عضلات مورب شکمی.' },
    { id: 'ab_roller', name_en: 'Ab Wheel Rollout', name_fa: 'رول شکم', muscle: 'Core', equipment: 'Bodyweight', difficulty: 'Advanced', type: 'Isolation', pattern: 'Core', description: 'فشار شدید روی کل شکم.' },
];

export const getExercisesByCriteria = (
    pattern: string | null,
    muscle: string | null, 
    equipmentAccess: Equipment[], 
    difficulty: Difficulty,
    type: 'Compound' | 'Isolation' | 'Cardio' | null = null,
    limit: number = 5
): ExerciseDef[] => {
    let candidates = EXERCISE_DB.filter(ex => {
        const eqMatch = ex.equipment === 'Bodyweight' || equipmentAccess.includes(ex.equipment);
        const muscleMatch = !muscle || ex.muscle === muscle || ex.secondary_muscles?.includes(muscle as any);
        const typeMatch = !type || ex.type === type;
        const patternMatch = !pattern || ex.pattern === pattern;
        
        return eqMatch && muscleMatch && typeMatch && patternMatch;
    });

    // Difficulty filtering (Soft)
    const exactDiff = candidates.filter(ex => ex.difficulty === difficulty);
    if (exactDiff.length > 0) candidates = exactDiff;

    return candidates.slice(0, limit);
};
