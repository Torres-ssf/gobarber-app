import { Platform } from 'react-native';
import {
  APP_ENV,
  API_HOST_ANDROID,
  API_HOST_IOS,
  API_PROD_HOST,
} from 'react-native-dotenv';

export const app = {
  env: APP_ENV,
  apiHost:
    APP_ENV === 'dev'
      ? Platform.OS === 'ios'
        ? API_HOST_IOS
        : API_HOST_ANDROID
      : API_PROD_HOST,
};
