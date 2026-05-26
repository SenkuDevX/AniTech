import { invoke } from '@tauri-apps/api/tauri';

export const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;

export async function updateDiscordPresence(details: string, state: string, largeImage: string, largeText: string, startTime?: number) {
  if (!isTauri) return;
  try {
    await invoke('update_discord_presence', {
      details,
      stateText: state,
      largeImage,
      largeText,
      startTimestamp: startTime ? Math.floor(startTime / 1000) : undefined,
    });
  } catch (err) {
    console.error('Failed to update Discord presence:', err);
  }
}

export async function clearDiscordPresence() {
  if (!isTauri) return;
  try {
    await invoke('clear_discord_presence');
  } catch (err) {
    console.error('Failed to clear Discord presence:', err);
  }
}
