"use client";

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function initFirebaseClient() {
  const apps = getApps();
  if (apps.length > 0) {
    // reuse the existing initialized app instance and ensure `auth` is set
    app = apps[0];
    try {
      if (!auth) auth = getAuth(app);
    } catch (e) {
      // ignore - getAuth may throw if app is not fully initialized yet
      console.debug('getAuth() threw when reusing existing app:', e);
    }
    return;
  }
  
  // Hardcoded config as fallback (temporary fix for env loading issues)
  const hardcodedConfig: FirebaseOptions = {
    apiKey: "AIzaSyAoQ3YwnG3OfNNj6M4LGvX3MgsxkhSgW0E",
    authDomain: "nong-san-so-mot-vn.firebaseapp.com",
    projectId: "nong-san-so-mot-vn",
    storageBucket: "nong-san-so-mot-vn.firebasestorage.app",
    messagingSenderId: "730746636570",
    appId: "1:730746636570:web:67fe7d4d60bb6318cc84a3"
  };
  
  // Try environment variable first (replaced at build time)
  let raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

  // If not provided via env (common in some dev setups), try browser fallbacks
  if (!raw && typeof window !== 'undefined') {
    const win = (window as unknown) as { __FIREBASE_CONFIG__?: unknown };
    if (win.__FIREBASE_CONFIG__) {
      try {
        raw = JSON.stringify(win.__FIREBASE_CONFIG__);
      } catch {
        raw = undefined;
      }
    } else {
      // Optionally allow embedding a <script id="firebase-config"> with JSON content
      const el = document.getElementById('firebase-config');
      if (el) raw = el.textContent || el.getAttribute('data-config') || undefined;
    }
  }

  let cfg: FirebaseOptions | undefined = undefined;
  
  if (raw) {
    try {
      cfg = JSON.parse(raw);
    } catch {
      // maybe it's a stringified object without strict JSON, attempt a safe eval fallback
      try {
        cfg = eval('(' + raw + ')');
      } catch {
        cfg = undefined;
      }
    }
  }
  
  // Use hardcoded config if env config not available
  if (!cfg) {
    console.warn('Using hardcoded Firebase config (env var not loaded)');
    cfg = hardcodedConfig;
  }

  console.debug('Initializing Firebase app (partial config shown):', { projectId: cfg.projectId, authDomain: cfg.authDomain });
  app = initializeApp(cfg);
  try {
    auth = getAuth(app);
    
    // For production with real SMS:
    // Comment out or set to false to enable real SMS sending via Firebase
    // Requires Firebase Blaze Plan (billing enabled)
    const useTestMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_TEST_PHONE === 'true';
    
    if (typeof window !== 'undefined' && useTestMode) {
      auth.settings.appVerificationDisabledForTesting = true;
      console.debug('App verification disabled for testing (test phone numbers enabled)');
    } else {
      console.debug('Using real SMS via Firebase Phone Auth (requires Blaze Plan)');
    }
  } catch (e) {
    // If getAuth fails for any reason, leave auth as null and allow caller to handle error
    console.error('getAuth() failed during initFirebaseClient:', e);
    auth = null;
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebaseClient();
  }
  if (!auth) {
    throw new Error('Firebase Auth could not be initialized. Check NEXT_PUBLIC_FIREBASE_CONFIG in .env.local');
  }
  return auth;
}

export function createRecaptchaVerifier(containerId: string) {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier must be created in the browser');
  }

  // Force init before getting auth
  initFirebaseClient();
  
  const a = getFirebaseAuth();

  // Check if app verification is disabled (for test phone numbers)
  if (a.settings?.appVerificationDisabledForTesting) {
    console.debug('App verification disabled - creating minimal RecaptchaVerifier for test phone numbers');
  }

  // Ensure container element exists - if not, create and append to body
  let containerEl = document.getElementById(containerId);
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = containerId;
    // keep it visually hidden
    containerEl.style.position = 'absolute';
    containerEl.style.left = '-9999px';
    document.body.appendChild(containerEl);
  }

  console.debug('Creating RecaptchaVerifier with container:', containerId, 'Auth instance:', !!a);

  // Firebase SDK v11: RecaptchaVerifier constructor takes (auth, container, parameters)
  // The first argument must be Auth instance, second is container (string ID or element), third is options
  try {
    const verifier = new RecaptchaVerifier(a, containerId, {
      size: 'invisible',
      callback: () => {
        console.debug('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      }
    });
    
    // attach for debugging
    (window as unknown as { __recaptcha_verifier?: RecaptchaVerifier }).__recaptcha_verifier = verifier;
    console.debug('RecaptchaVerifier created successfully');
    return verifier;
  } catch (err) {
    console.error('Failed to create RecaptchaVerifier:', err);
    throw err;
  }
}

export async function sendSignInCode(phoneNumber: string, verifier: RecaptchaVerifier) {
  initFirebaseClient();
  const a = getFirebaseAuth();
  return signInWithPhoneNumber(a, phoneNumber, verifier);
}
