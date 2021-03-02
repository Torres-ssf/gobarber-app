declare module '*.png';

declare module 'react-native-dotenv' {
  export const APP_ENV: 'dev' | 'prod';
  export const API_HOST_IOS: string;
  export const API_HOST_ANDROID: string;
  export const API_PROD_HOST: string;
}
