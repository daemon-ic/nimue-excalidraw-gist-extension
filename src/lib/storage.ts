import browser from 'webextension-polyfill';
import { DEFAULT_SETTINGS, STORAGE, type Settings } from '@/lib/constants';
import type { DrawingMeta } from '@/types';

export async function getToken(): Promise<string | null> {
  const data = await browser.storage.local.get(STORAGE.token);
  return (data[STORAGE.token] as string) || null;
}

export async function setToken(token: string): Promise<void> {
  await browser.storage.local.set({ [STORAGE.token]: token });
}

export async function clearToken(): Promise<void> {
  await browser.storage.local.remove(STORAGE.token);
}

export async function getActiveDrawing(): Promise<DrawingMeta | null> {
  const data = await browser.storage.local.get(STORAGE.activeDrawing);
  return (data[STORAGE.activeDrawing] as DrawingMeta) || null;
}

export async function setActiveDrawing(drawing: DrawingMeta | null): Promise<void> {
  await browser.storage.local.set({ [STORAGE.activeDrawing]: drawing });
}

export async function getSettings(): Promise<Settings> {
  const data = await browser.storage.local.get(STORAGE.settings);
  return { ...DEFAULT_SETTINGS, ...(data[STORAGE.settings] as Settings | undefined) };
}

export async function setSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ [STORAGE.settings]: settings });
}
