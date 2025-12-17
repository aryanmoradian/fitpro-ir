
import React, { useState, useEffect } from 'react';
import { Menu, Phone, LogIn, ChevronLeft, Crosshair } from 'lucide-react';
import FPBadge from './FPBadge';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onOpenMenu: () => void;
}

const NavItem: React.FC<{ label: string; href: string; isActive?: boolean }> = ({ label, href, isActive }) => (
  <a 
    href={href} 
    className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 group flex items-center ${
      isActive ? 'text-[#D4FF00]' : 'text-[#8F9A8C] hover:text-white'
    }`}
  >
    {/* Active/Hover Reticle Marker */}
    <span className={`absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#D4FF00] rounded-full opacity-0 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}></span>
    
    {label}
    
    {/* Underline Scan Effect */}
    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#D4FF00] transition-all duration-300 ease-out ${isActive ? 'w-full' : 'w-0 group-hover:w-1/2'}`}></span>
  </a>
);

const TacticalButton: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  primary?: boolean; 
  onClick?: () => void;
  href?: string;
}> = ({ icon: Icon, label, primary, onClick, href }) => {
  const baseClass = "relative overflow-hidden group flex items-center gap-2 px-6 py-2.5 font-black text-sm uppercase tracking-wide transition-all duration-200 clip-path-chamfer";
  const colorClass = primary 
    ? "bg-[#D4FF00] text-black hover:bg-white" 
    : "bg-white/5 text-[#D4FF00] border border-[#D4FF00]/30 hover:bg-[#D4FF00]/10 hover:border-[#D4FF00]";

  const content = (
    <>
      <Icon size={16} className={`relative z-10 transition-transform group-hover:scale-110 ${primary ? "stroke-2" : ""}`} />
      <span className="relative z-10">{label}</span>
      {/* Tactical Glint Effect */}
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
    </>
  );

  if (href) {
    return <a href={href} className={`${baseClass} ${colorClass}`}>{content}</a>;
  }
  
  return <button onClick={onClick} className={`${baseClass} ${colorClass}`}>{content}</button>;
};

const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header Container - Ballistic Glass Effect */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'h-20 bg-[#0F120D]/90 backdrop-blur-md border-[#3E4A3E] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
            : 'h-24 bg-transparent border-transparent'
        }`}
      >
        {/* Top Decorative Tech Line (Only visible when scrolled) */}
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4FF00]/50 to-transparent transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* RIGHT: Logo Section (Command Insignia) */}
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4FF00] blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <FPBadge className={`relative z-10 transition-all duration-300 drop-shadow-2xl ${isScrolled ? 'w-10 h-10' : 'w-14 h-14'}`} />
            </div>
            
            <div className="hidden min-[450px]:flex flex-col text-right border-r-2 border-[#3E4A3E] pr-4 mr-2">
              <h1 className="text-2xl font-black text-white leading-none tracking-tight font-heading">
                فیت پرو
              </h1>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-[#D4FF00] rounded-sm animate-pulse"></span>
                <span className="text-[10px] text-[#8F9A8C] font-bold tracking-widest uppercase font-mono">
                  SYSTEM ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Tactical Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#151915]/80 backdrop-blur-sm px-6 py-2 rounded-lg border border-[#3E4A3E]/50 clip-path-slant">
            <NavItem label="داشبورد" href="#" isActive />
            <div className="w-px h-4 bg-[#3E4A3E] mx-2 rotate-12"></div>
            <NavItem label="تعرفه‌ها" href="#plans" />
            <div className="w-px h-4 bg-[#3E4A3E] mx-2 rotate-12"></div>
            <NavItem label="آکادمی" href="#" />
            <div className="w-px h-4 bg-[#3E4A3E] mx-2 rotate-12"></div>
            <NavItem label="مربیان" href="#" />
          </nav>

          {/* LEFT: Action Modules */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <TacticalButton 
                icon={Phone} 
                label="مشاوره" 
                href="tel:09981749697"
              />
              <TacticalButton 
                icon={LogIn} 
                label="ورود" 
                primary 
                onClick={() => window.location.reload()} 
              />
            </div>

            {/* Mobile Actions */}
            <a 
              href="tel:09981749697"
              className="md:hidden p-2.5 bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/20 rounded-md hover:bg-[#D4FF00] hover:text-black transition-colors"
            >
              <Phone size={20} />
            </a>

            {/* Hamburger Trigger */}
            <button 
              onClick={onOpenMenu} 
              className="lg:hidden p-2.5 text-white hover:text-[#D4FF00] transition-colors relative group"
              aria-label="Menu"
            >
              <div className="absolute inset-0 border border-[#3E4A3E] rounded-md group-hover:border-[#D4FF00]/50 transition-colors"></div>
              <Menu size={24} />
            </button>
          </div>

        </div>
      </header>

      {/* CSS Injection for custom clip-paths if not in global CSS */}
      <style>{`
        .clip-path-chamfer {
          clip-path: polygon(
            10px 0, 100% 0, 
            100% calc(100% - 10px), calc(100% - 10px) 100%, 
            0 100%, 0 10px
          );
        }
        .clip-path-slant {
          clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
        }
      `}</style>
    </>
  );
};

export default Header;
