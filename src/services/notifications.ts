export interface ReminderPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    action?: string;
  };
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

export function formatStreakReminderCopy(streak: number, habitCount: number): { title: string; body: string } {
  if (streak >= 7) {
    return {
      title: `⚡ Don't break your ${streak}-day run!`,
      body: `You have ${habitCount} habits waiting. Check in now to protect your ${streak}-day multiplier!`,
    };
  } else if (streak >= 1) {
    return {
      title: `🧪 Streak Lab: Time for Daily Check-in`,
      body: `Keep your ${streak}-day streak alive! 15-minute countdown starts now.`,
    };
  } else {
    return {
      title: `🚀 Streak Lab: Daily Check-in Window Open`,
      body: `Build your discipline! Mark today's habits to start earning league XP and vault rewards.`,
    };
  }
}

export async function sendLocalNotification(payload: ReminderPayload): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg.showNotification) {
        await reg.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/icon-192.png',
          badge: payload.badge || '/icons/icon-192.png',
          tag: 'streak-lab-reminder',
          vibrate: [200, 100, 200],
          data: payload.data || { url: '/?action=checkin' },
        } as NotificationOptions);
        return true;
      }
    }

    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
    });
    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

export function scheduleTestReminder(
  streak: number,
  habitCount: number,
  delaySeconds = 10,
  onDelivered?: () => void
): number {
  const { title, body } = formatStreakReminderCopy(streak, habitCount);

  const timeoutId = window.setTimeout(async () => {
    await sendLocalNotification({
      title: `[TEST] ${title}`,
      body,
      data: { url: '/?action=checkin' },
    });
    if (onDelivered) onDelivered();
  }, delaySeconds * 1000);

  return timeoutId;
}
