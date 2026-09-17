/**
 * Real-Time Synchronization Hub
 * Ensures instant real-time synchronization between Customer Booking Flow,
 * Owner/Admin Dashboard, Live Queue Tracking, and Customer Garage Portal.
 * Uses BroadcastChannel + CustomEvents + Storage Events for zero-latency sync across all tabs.
 */

const CHANNEL_NAME = 'carwash_live_sync_channel';
const STORAGE_KEY = 'carwash_live_sync_ping';

let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel initialization fallback:', err);
  }
}

/**
 * Dispatch a live sync event across the entire application and all open browser tabs
 * @param {Object} eventData - { type: 'BOOKING_CREATED' | 'STATUS_UPDATED' | 'WALKIN_CREATED', ...data }
 */
export function notifyLiveSync(eventData = {}) {
  if (typeof window === 'undefined') return;

  const payload = {
    ...eventData,
    timestamp: Date.now()
  };

  // 1. Same-window / same-tab instant dispatch
  try {
    window.dispatchEvent(new CustomEvent('carwash_live_sync', { detail: payload }));
  } catch (e) {}

  // 2. Cross-tab BroadcastChannel dispatch
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {}
  }

  // 3. Cross-tab localStorage event fallback
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}
}

/**
 * Subscribe to real-time sync events
 * @param {Function} callback - Function to execute when any sync event is received
 * @returns {Function} unsubscribe cleanup function
 */
export function subscribeLiveSync(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  // Same-window listener
  const handleCustomEvent = (e) => {
    callback(e.detail || {});
  };

  // BroadcastChannel listener
  const handleBroadcastMessage = (e) => {
    if (e.data) {
      callback(e.data);
    }
  };

  // Storage listener for cross-tab fallback
  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {
        callback({});
      }
    }
  };

  window.addEventListener('carwash_live_sync', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Return unsubscribe cleanup function
  return () => {
    window.removeEventListener('carwash_live_sync', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
  };
}
