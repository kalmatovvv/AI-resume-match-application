module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['backend/node_modules/', 'frontend/node_modules/', 'dist/', 'build/'],
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};







