import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { PaperProvider } from 'react-native-paper';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Lalezar': require("../assets/fonts/Lalezar-Regular.ttf"),
    ...FontAwesome.font,
  });
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ presentation: 'modal',headerShown:false }} />
          <Stack.Screen name="register" options={{ presentation: 'modal',headerShown:false }} />
          <Stack.Screen name="login" options={{ presentation: 'modal',headerShown:false }} />
          <Stack.Screen name="checkout" options={{ presentation: 'modal',headerShown:false }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal',headerShown:false }} />
          <Stack.Screen name="scanner" options={{ presentation: 'modal' ,headerShown:false}} />
          <Stack.Screen name="profile" options={{ presentation: 'modal' ,headerShown:false}} />
          <Stack.Screen name="otp" options={{ presentation: 'modal' ,headerShown:false}} />
          <Stack.Screen name="payment" options={{ presentation: 'modal' ,headerShown:false}} />
          <Stack.Screen name="finished" options={{ presentation: 'modal' ,headerShown:false}} />
          <Stack.Screen name="[id]" options={{ presentation: 'modal' ,headerShown:false}} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
