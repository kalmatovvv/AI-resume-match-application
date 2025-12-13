import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import App from './pages/App.jsx';
import './index.css';

const queryClient = new QueryClient();

const cognitoAuthConfig = {
  authority: `https://cognito-idp.${import.meta.env.VITE_COGNITO_REGION || 'us-east-1'}.amazonaws.com/${import.meta.env.VITE_COGNITO_USER_POOL_ID}`,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: 'https://airesumematchapp.vercel.app/',
  response_type: 'code',
  scope: 'email openid profile',
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider {...cognitoAuthConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </AuthProvider>
);


