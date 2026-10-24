import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Trophy, Users, BarChart3 } from 'lucide-react';
import { useAppStore, NavTab } from '../../stores/useAppStore';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'vault', label: 'Vault', icon: Trophy },
  { id: 'league', label: 'League', icon: Users },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe-offset-2 pt-2">
      <div className="max-w-md mx-auto mb-2 bg-[#090d16]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-1.5 shadow-2xl shadow-black/80 flex items-center justify-around relative">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isActive) {
                  sound.playPop();
                  haptics.light();
                  setCurrentTab(item.id);
                }
              }}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-colors focus:outline-none select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-pink-600/25 to-cyan-500/20 border border-purple-500/40 rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold mt-1 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
