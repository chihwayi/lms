const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force resolution of critical dependencies to the local version
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'react': path.resolve(projectRoot, 'node_modules/react'),
    'react/jsx-runtime': path.resolve(projectRoot, 'node_modules/react/jsx-runtime'),
    'react/jsx-dev-runtime': path.resolve(projectRoot, 'node_modules/react/jsx-dev-runtime'),
    'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    '@react-navigation/native': path.resolve(projectRoot, 'node_modules/@react-navigation/native'),
};

// 4. Exclude root React/ReactDOM to prevent duplicates
config.resolver.blockList = [
  // Block root react and react-dom
  new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react')}/.*`),
  new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react-dom')}/.*`),
  // Also block root react-native if it exists
  new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react-native')}/.*`),
];

module.exports = config;
