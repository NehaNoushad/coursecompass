/**
 * Supabase client. One singleton, used everywhere data + auth touch
 * the backend. Configuration comes from env vars set in .env.local
 * (see .env.example for the template); on web they're inlined into
 * the bundle at build time, on native they're read via expo-constants.
 *
 * Auth state persists across reloads via AsyncStorage (works on
 * web via a localStorage adapter and on native via the real
 * AsyncStorage). Token refresh is handled automatically — we just
 * need to feed AppState events to it on native; the web layer
 * handles its own focus/visibility tracking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Loud, early failure — better than a confusing 401 later.
  console.error(
    'Missing Supabase env vars. Copy .env.example to .env.local and ' +
      'fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// On native, Supabase needs us to tell it when the app comes back
// into foreground so it can refresh the access token. On web the
// library handles this internally via visibilitychange.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
