import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/dexie';
import { seedDatabase } from './db/seedData';
import { Habit, CheckInRecord, Reward, Friend, UserProfile } from './types';
import { useAppStore } from './stores/useAppStore';
import { ParticleBackground } from './components/common/ParticleBackground';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { HabitsView } from './components/habits/HabitsView';
import { VaultView } from './components/vault/VaultView';
import { LeagueView } from './components/league/LeagueView';
import { InsightsView } from './components/insights/InsightsView';
import { CheckInModal } from './components/checkin/CheckInModal';
import { PerfectDayCelebration } from './components/checkin/PerfectDayCelebration';
import { VaultUnlockModal } from './components/vault/VaultUnlockModal';
import { HabitFormModal } from './components/habits/HabitFormModal';
import { FocusTimerModal } from './components/habits/FocusTimerModal';
import { RewardFormModal } from './components/vault/RewardFormModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { HealthScreen } from './components/settings/HealthScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { sound } from './services/audio';
import { haptics } from './services/haptics';
import { format } from 'date-fns';

export const App: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    isCheckInModalOpen,
    setCheckInModalOpen,
    isPerfectDayModalOpen,
    setPerfectDayModalOpen,
    activeFocusHabitId,
    setActiveFocusHabitId,
    isHealthModalOpen,
    setHealthModalOpen,
    toastMessage,
    showToast,
  } = useAppStore();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isHabitFormOpen, setHabitFormOpen] = useState(false);
  const [isRewardFormOpen, setRewardFormOpen] = useState(false);
  const [unlockingReward, setUnlockingReward] = useState<Reward | null>(null);
  const [celebrationData, setCelebrationData] = useState<{ points: number; streak: number } | null>(null);

  // Seed DB on startup
  useEffect(() => {
    seedDatabase();
  }, []);

  // Handle URL query parameters (e.g. ?action=checkin or ?tab=vault)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'checkin') {
      setCheckInModalOpen(true);
    }
    const tabParam = params.get('tab');
    if (tabParam && ['today', 'habits', 'vault', 'league', 'insights'].includes(tabParam)) {
      setCurrentTab(tabParam as any);
    }
  }, [setCheckInModalOpen, setCurrentTab]);

  // Reactive DB queries via Dexie hooks
  const habits = useLiveQuery(() => db.habits.toArray(), [], []) as Habit[];
  const rewards = useLiveQuery(() => db.rewards.toArray(), [], []) as Reward[];
  const friends = useLiveQuery(() => db.friends.toArray(), [], []) as Friend[];
  const user = useLiveQuery(() => db.userProfile.get('current-user'), []);
  const allCheckIns = useLiveQuery(() => db.checkIns.toArray(), [], []) as CheckInRecord[];

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = allCheckIns.filter((c) => c.date === todayStr);

  // Sync sound & haptics preference
  useEffect(() => {
    if (user) {
      sound.enabled = user.soundEnabled ?? true;
      haptics.enabled = user.hapticsEnabled ?? true;
    }
  }, [user]);

  // Habit CRUD handlers
  const handleSaveHabit = async (data: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      await db.habits.update(data.id, {
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        schedule: data.schedule,
        customDays: data.customDays,
        difficulty: data.difficulty,
        focusDuration: data.focusDuration,
        reminderOverride: data.reminderOverride,
      });
      showToast('Habit updated ✨');
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        schedule: data.schedule,
        customDays: data.customDays,
        difficulty: data.difficulty,
        focusDuration: data.focusDuration,
        reminderOverride: data.reminderOverride,
        archived: false,
        createdAt: new Date().toISOString(),
      };
      await db.habits.add(newHabit);
      showToast('New habit added to matrix 🚀');
    }
    setHabitFormOpen(false);
    setHabitToEdit(null);
  };

  const handleDeleteHabit = async (id: string) => {
    await db.habits.delete(id);
    showToast('Habit removed');
    setHabitFormOpen(false);
    setHabitToEdit(null);
  };

  const handleToggleHabitDone = async (habitId: string) => {
    const existing = todayRecords.find((r) => r.habitId === habitId);
    if (existing?.status === 'done') {
      await db.checkIns.delete(existing.id);
      showToast('Marked uncompleted');
    } else {
      const newRecord: CheckInRecord = {
        id: `${todayStr}_${habitId}`,
        habitId,
        date: todayStr,
        status: 'done',
        completedAt: new Date().toISOString(),
      };
      await db.checkIns.put(newRecord);

      // Add points to user
      const habit = habits.find((h) => h.id === habitId);
      const pts = habit?.difficulty === 'easy' ? 10 : habit?.difficulty === 'medium' ? 20 : 30;
      if (user) {
        await db.userProfile.update(user.id, {
          points: user.points + pts,
        });
      }
    }
  };

  // CheckIn Modal Save handler
  const handleSaveCheckIn = async (
    records: CheckInRecord[],
    pointsEarned: number,
    newStreak: number,
    newFreezes: number,
    isPerfectDay: boolean
  ) => {
    await db.checkIns.bulkPut(records);
    if (user) {
      await db.userProfile.update(user.id, {
        points: user.points + pointsEarned,
        streak: newStreak,
        streakFreezes: newFreezes,
        lastCheckInDate: todayStr,
      });
    }

    setCheckInModalOpen(false);

    if (isPerfectDay) {
      setCelebrationData({ points: pointsEarned, streak: newStreak });
      setPerfectDayModalOpen(true);
    } else {
      showToast(`Daily check-in saved! +${pointsEarned} XP ⚡`);
    }
  };

  // Focus Timer complete
  const handleCompleteFocusHabit = async (habitId: string) => {
    await handleToggleHabitDone(habitId);
    setActiveFocusHabitId(null);
    showToast('Focus session complete! Habit marked Done! 🎯');
  };

  // Reward save & unlock handlers
  const handleSaveReward = async (data: Omit<Reward, 'id' | 'createdAt' | 'status'>) => {
    const newReward: Reward = {
      id: `reward-${Date.now()}`,
      name: data.name,
      emoji: data.emoji,
      targetPoints: data.targetPoints,
      status: 'locked',
      createdAt: new Date().toISOString(),
    };
    await db.rewards.add(newReward);
    setRewardFormOpen(false);
    showToast('Vault reward created 🎁');
  };

  const handleClaimReward = async (rewardId: string) => {
    await db.rewards.update(rewardId, {
      status: 'bought',
      boughtAt: new Date().toISOString(),
    });
    setUnlockingReward(null);
    showToast('Moved to permanent Trophy Shelf! 🏆');
  };

  // Send Cheer handler
  const handleSendCheer = async (friendId: string, emoji: string, message: string) => {
    await db.cheers.add({
      id: `cheer-${Date.now()}`,
      fromName: user?.name || 'You',
      toFriendId: friendId,
      emoji,
      message,
      timestamp: new Date().toISOString(),
    });
    showToast(`Cheer sent! ${emoji}`);
  };

  const handleResetDemoData = async () => {
    await seedDatabase(true);
    showToast('Demo data reloaded successfully ⚡');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 animate-pulse flex items-center justify-center text-2xl">
            🧪
          </div>
          <span className="text-xs font-semibold text-slate-400">Loading Streak Lab...</span>
        </div>
      </div>
    );
  }

  const focusHabit = habits.find((h) => h.id === activeFocusHabitId) || null;
  const closestReward = rewards.filter((r) => r.status !== 'bought').sort((a, b) => a.targetPoints - b.targetPoints)[0] || null;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col relative select-none">
      {/* Background Animated Gradient & Floating Lab Particles */}
      <ParticleBackground />

      {/* Top Header */}
      <TopHeader
        user={user}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleSound={async () => {
          const next = !user.soundEnabled;
          sound.enabled = next;
          await db.userProfile.update(user.id, { soundEnabled: next });
        }}
        soundEnabled={user.soundEnabled ?? true}
      />

      {/* Main View Port */}
      <main className="flex-1 relative z-10 max-w-md w-full mx-auto">
        {currentTab === 'today' && (
          <TodayDashboard
            habits={habits}
            todayRecords={todayRecords}
            closestReward={closestReward}
            user={user}
            userRank={2}
            onOpenCheckIn={() => setCheckInModalOpen(true)}
            onToggleHabitDone={handleToggleHabitDone}
            onOpenTimer={(h) => setActiveFocusHabitId(h.id)}
            onEditHabit={(h) => {
              setHabitToEdit(h);
              setHabitFormOpen(true);
            }}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'habits' && (
          <HabitsView
            habits={habits}
            todayRecords={todayRecords}
            onAddNew={() => {
              setHabitToEdit(null);
              setHabitFormOpen(true);
            }}
            onEdit={(h) => {
              setHabitToEdit(h);
              setHabitFormOpen(true);
            }}
            onToggleDone={handleToggleHabitDone}
            onOpenTimer={(h) => setActiveFocusHabitId(h.id)}
          />
        )}

        {currentTab === 'vault' && (
          <VaultView
            rewards={rewards}
            user={user}
            onAddNewReward={() => setRewardFormOpen(true)}
            onOpenUnlockCinematic={(r) => setUnlockingReward(r)}
          />
        )}

        {currentTab === 'league' && (
          <LeagueView
            friends={friends}
            user={user}
            leagueCode="LAB-9842"
            onSendCheer={handleSendCheer}
            onJoinLeague={(code) => showToast(`Joined league: ${code}`)}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsView habits={habits} checkIns={allCheckIns} user={user} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        habits={habits.filter((h) => !h.archived)}
        user={user}
        existingRecords={todayRecords}
        onSaveCheckIn={handleSaveCheckIn}
        onClose={() => setCheckInModalOpen(false)}
      />

      <PerfectDayCelebration
        isOpen={isPerfectDayModalOpen}
        totalPointsEarned={celebrationData?.points || 120}
        newStreak={celebrationData?.streak || user.streak}
        onClose={() => setPerfectDayModalOpen(false)}
      />

      <FocusTimerModal
        habit={focusHabit}
        isOpen={Boolean(activeFocusHabitId)}
        onCompleteHabit={handleCompleteFocusHabit}
        onClose={() => setActiveFocusHabitId(null)}
      />

      <HabitFormModal
        isOpen={isHabitFormOpen}
        habitToEdit={habitToEdit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        onClose={() => {
          setHabitFormOpen(false);
          setHabitToEdit(null);
        }}
      />

      <RewardFormModal
        isOpen={isRewardFormOpen}
        onSave={handleSaveReward}
        onClose={() => setRewardFormOpen(false)}
      />

      <VaultUnlockModal
        reward={unlockingReward}
        isOpen={Boolean(unlockingReward)}
        onClaim={handleClaimReward}
        onClose={() => setUnlockingReward(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        user={user}
        habits={habits}
        checkIns={allCheckIns}
        onUpdateUser={async (updated) => {
          await db.userProfile.update(user.id, updated);
        }}
        onResetDemo={handleResetDemoData}
        onOpenHealth={() => setHealthModalOpen(true)}
        onClose={() => setSettingsOpen(false)}
      />

      <HealthScreen
        isOpen={isHealthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />

      <OnboardingModal
        isOpen={!user.hasCompletedOnboarding}
        onComplete={async (name, avatar, notifs) => {
          await db.userProfile.update(user.id, {
            name,
            avatar,
            reminderEnabled: notifs,
            hasCompletedOnboarding: true,
          });
          showToast(`Welcome to Streak Lab, ${name}! 🧪`);
        }}
      />

      {/* Global Cyber Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#161c30]/95 border border-purple-500/40 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-xl shadow-purple-500/20 backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
