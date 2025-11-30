import React, { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const loadUser = useAuthStore((state) => state.loadUser);
  const hasLoaded = useRef(false); // ✅ Track if already loaded

  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (hasLoaded.current) return; // ✅ Prevent re-runs
    
    async function prepare() {
      try {
        console.log('🚀 App starting - Loading user...');
        hasLoaded.current = true; // ✅ Mark as loaded
        await loadUser();
        console.log('✅ User loaded successfully');
      } catch (e) {
        console.error('❌ Error loading user:', e);
      } finally {
        console.log('✅ App ready');
        setAppIsReady(true);
      }
    }

    prepare();
  }, [loadUser]);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      console.log('🎉 Hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(farmer)" />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}