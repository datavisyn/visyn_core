import type { Client } from '@sentry/core';

import type { ILogoutOptions, IUser } from '../security';

/**
 * Definition of the custom events that can be dispatched and listened to.
 */
export interface VisynEventMap {
  sentryInitialized: { client: Client | undefined };
  userLoggedIn: { user: IUser | null };
  userLoggedOut: { options: ILogoutOptions };
}

/**
 * Typed custom event.
 */
export type VisynEvent<K extends keyof VisynEventMap> = CustomEvent<VisynEventMap[K]>;

/**
 * Dispatch a typed custom event.
 */
export function dispatchVisynEvent<K extends keyof VisynEventMap>(eventName: K, detail: VisynEventMap[K]): void {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
}

/**
 * Listen for a typed custom event.
 */
export function addVisynEventListener<K extends keyof VisynEventMap>(eventName: K, callback: (event: CustomEvent<VisynEventMap[K]>) => void): void {
  window.addEventListener(eventName, callback as EventListener);
}

/**
 * Remove an event listener.
 */
export function removeVisynEventListener<K extends keyof VisynEventMap>(eventName: K, callback: (event: CustomEvent<VisynEventMap[K]>) => void): void {
  window.removeEventListener(eventName, callback as EventListener);
}
