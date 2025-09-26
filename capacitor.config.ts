
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sarl.sportdataanalytics.app',
  appName: 'SportDataAnalytics',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://app.sportdataanalytics.dz",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
