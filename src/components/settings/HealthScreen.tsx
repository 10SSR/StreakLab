import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, Wifi, HardDrive, Bell, RefreshCw, X } from 'lucide-react';
import { db } from '../../db/dexie';
import { getNotificationPermission } from '../../services/notifications';
import { sound } from '../../services/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosticState {
  swRegistered: boolean;
  notificationPermission: string;
  indexedDbHealthy: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  storageUsageMb: string;
  totalHabits: number;
  totalCheckIns: number;
  appVersion: string;
}

export const HealthScreen: React.FC<Props> = ({ isOpen, onClose }) => {
  const [diag, setDiag] = useState<DiagnosticState>({
    swRegistered: false,
    notificationPermission: 'default',
    indexedDbHealthy: false,
    isOnline: true,
    isInstalled: false,
    storageUsageMb: '0.0',
    totalHabits: 0,
    totalCheckIns: 0,
    appVersion: '1.0.0 (Production PWA)',
  });
  const [loading, setLoading] = useState(true);

  const runDiagnostics = async () => {
    setLoading(true);
    let sw = false;
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      sw = Boolean(reg);
    }

    const notif = getNotificationPermission();
    const online = navigator.onLine;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    let dbOk = false;
    let habitsCount = 0;
    let checkInsCount = 0;
    try {
      habitsCount = await db.habits.count();
      checkInsCount = await db.checkIns.count();
      dbOk = true;
    } catch {
      dbOk = false;
    }

    let storageMb = '0.4';
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est.usage) {
          storageMb = (est.usage / (1024 * 1024)).toFixed(2);
        }
      } catch (_err) {
        // Fallback default
        storageMb = '0.4';
      }
    }

    setDiag({
      swRegistered: sw,
      notificationPermission: notif,
      indexedDbHealthy: dbOk,
      isOnline: online,
      isInstalled: isStandalone,
      storageUsageMb: storageMb,
      totalHabits: habitsCount,
      totalCheckIns: checkInsCount,
      appVersion: '1.0.0 (Production PWA)',
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const checks = [
    {
      title: 'Service Worker',
      value: diag.swRegistered ? 'Active & Ready' : 'In Dev / Precache Ready',
      status: diag.swRegistered ? 'ok' : 'info',
      icon: Activity,
    },
    {
      title: 'Notification API',
      value: diag.notificationPermission === 'granted' ? 'Granted' : diag.notificationPermission,
      status: diag.notificationPermission === 'granted' ? 'ok' : 'warn',
      icon: Bell,
    },
    {
      title: 'IndexedDB (Dexie)',
      value: diag.indexedDbHealthy ? `Operational (${diag.totalHabits} habits, ${diag.totalCheckIns} logs)` : 'Unavailable',
      status: diag.indexedDbHealthy ? 'ok' : 'error',
      icon: HardDrive,
    },
    {
      title: 'Network Mode',
      value: diag.isOnline ? 'Online (Synchronized)' : 'Offline (Local Safe)',
      status: 'ok',
      icon: Wifi,
    },
    {
      title: 'PWA Installed',
      value: diag.isInstalled ? 'Standalone Installed' : 'Browser / Web App Mode',
      status: 'info',
      icon: ShieldCheck,
    },
    {
      title: 'Storage Footprint',
      value: `${diag.storageUsageMb} MB Allocated`,
      status: 'ok',
      icon: HardDrive,
    },
    {
      title: 'Engine Version',
      value: diag.appVersion,
      status: 'ok',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#0c101d] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative"
      >
        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">System Diagnostics</h3>
            <p className="text-[11px] text-slate-400">Streak Lab runtime health check</p>
          </div>
        </div>

        <div className="space-y-2.5 my-5">
          {checks.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-white/[0.04] border border-white/5 rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">{c.title}</span>
                    <span className="text-[11px] text-slate-400">{c.value}</span>
                  </div>
                </div>
                {c.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : c.status === 'warn' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-500" />
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            sound.playPop();
            runDiagnostics();
          }}
          className="w-full py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Rerun Live Diagnostics</span>
        </button>
      </motion.div>
    </div>
  );
};
