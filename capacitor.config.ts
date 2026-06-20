import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shaurya.space',
  appName: 'Space',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    deploymentTarget: '16.0',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
