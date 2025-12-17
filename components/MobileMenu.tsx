
import React from 'react';
import { X, Home, Activity, BookOpen, Users, Instagram, Phone, ChevronLeft, Target } from 'lucide-react';
import FPBadge from './FPBadge';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuItem: React.FC<{ icon: React.ElementType; label: string; href: string }> = ({ icon: Icon, label, href }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4 p-4 border-b border-[#3E4A3E]/30 text-gray-300 hover:text-[#D4FF00] hover:bg-white/5 transition-all group"
  >
    <div className="p-2 rounded bg-[#151915] border border-[#3E4A3E] group-hover:border-[#D4FF00] transition-colors">
      <Icon size={20} />
    </div>
    <span className="font-bold flex-1">{label}</span>
    <ChevronLeft size={16} className="text-[#3E4A3E] group-hover:text-[#D4FF00] transition-colors" />
  </a>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: Home, label: 'خانه', href: 'https://fit-pro.ir' },
    { icon: Target, label: 'برنامه‌ها', href: '#plans' },
    { icon: BookOpen, label: 'مجله تخصصی', href: 'https://www.mokamelfitpro.ir/articles/' },
    { icon: Users, label: 'گروه آموزشی واتساپ', href: 'https://chat.whatsapp.com/JkWkKSmtesJ1QID0bgNry7' },
    { icon: Instagram, label: 'اینستاگرام فیت پرو', href: 'https://instagram.com/fitpro.ir' },
  ];

  return (
    <>
      {/* Tactical Backdrop (Dimmed with scanline texture) */}
      <div 
        className={`fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-in Panel (Right Side for RTL) */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[#0F120D] border-l border-[#3E4A3E] z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Area */}
        <div className="p-6 flex items-center justify-between border-b border-[#3E4A3E] bg-[#151915]">
          <div className="flex items-center gap-3">
            <FPBadge className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="font-black text-white text-lg leading-none">فیت پرو</span>
              <span className="text-[10px] text-[#D4FF00] font-mono tracking-widest">MOBILE UNIT</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {menuItems.map((item, idx) => (
              <MenuItem key={idx} {...item} />
            ))}
          </div>
        </div>

        {/* Footer / Status */}
        <div className="p-6 border-t border-[#3E4A3E] bg-[#151915]">
          <a 
            href="tel:09981749697"
            className="w-full bg-[#D4FF00] hover:bg-white text-black font-black py-3 rounded clip-path-chamfer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,255,0,0.3)] transition-all active:scale-95"
          >
            <Phone size={18} className="stroke-2" />
            <span>تماس اضطراری (پشتیبانی)</span>
          </a>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#8F9A8C] font-mono">
              SECURE CONNECTION ESTABLISHED
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        .clip-path-chamfer {
          clip-path: polygon(
            10px 0, 100% 0, 
            100% calc(100% - 10px), calc(100% - 10px) 100%, 
            0 100%, 0 10px
          );
        }
      `}</style>
    </>
  );
};

export default MobileMenu;
