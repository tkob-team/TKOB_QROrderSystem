/**
 * Sound Notification System
 * Handles audio notifications for KDS and Waiter dashboards
 * Features:
 * - Repeat beeps (3-5 times)
 * - Cooldown to prevent spam (5 seconds)
 * - Distinct sounds for different events
 */

type SoundType = 'waiter-new-order' | 'kds-new-order' | 'kds-overdue';

const soundFiles: Record<SoundType, string> = {
  'waiter-new-order': '/sounds/bell-soft.wav',
  'kds-new-order': '/sounds/bell-kitchen.wav',
  'kds-overdue': '/sounds/alert-urgent.wav',
};

let lastPlayTime = 0;
const MIN_INTERVAL_MS = 5000; // 5 seconds cooldown between bursts

/**
 * Play notification sound with repeat beeps
 * @param type - Type of notification sound
 * @param repeatCount - Number of times to repeat (default: 3)
 */
export function playNotificationSound(type: SoundType, repeatCount = 3) {
  const now = Date.now();
  
  // Prevent spam - enforce cooldown
  if (now - lastPlayTime < MIN_INTERVAL_MS) {
    return;
  }
  
  lastPlayTime = now;
  const audio = new Audio(soundFiles[type]);
  audio.volume = 0.7; // Set volume to 70%
  
  let played = 0;
  const playNext = () => {
    if (played < repeatCount) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Failed to play audio
      });
      played++;
      
      // 800ms between beeps
      if (played < repeatCount) {
        setTimeout(playNext, 800);
      }
    }
  };
  
  playNext();
}

/**
 * Test function for development
 */
export function testSound(type: SoundType) {
  playNotificationSound(type, 1);
}
