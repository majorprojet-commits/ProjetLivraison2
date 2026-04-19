import { withExpo } from '@expo/next-adapter';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    'react-native-web',
    'expo',
    'lucide-react',
    'lucide-react-native',
    '@react-navigation/native',
    '@react-navigation/stack',
    'react-native-screens',
    'react-native-safe-area-context',
    'react-native-gesture-handler',
    'react-native-svg',
    'recharts',
    'framer-motion'
  ],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native/Libraries/Renderer/shims/ReactNativeTypes': 'react-native-web/dist/index',
      'react-native/Libraries/ReactNative/requireNativeComponent': 'react-native-web/dist/index',
      'react-native/Libraries/Utilities/codegenNativeComponent': 'react-native-web/dist/index',
      'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo': 'react-native-web/dist/index',
      'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator': 'react-native-web/dist/index',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default withExpo(nextConfig);
