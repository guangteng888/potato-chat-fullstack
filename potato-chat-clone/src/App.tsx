import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

// Store hooks
import { useAuthStore } from './store/authStore';

// Services
import { socketService } from './services/socketService';
import { apiService } from './services/apiService';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import AuthLayout from './components/auth/AuthLayout';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import WalletPage from './pages/WalletPage';
import MiniAppsPage from './pages/MiniAppsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, token, user, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      setLoading(true);

      try {
        // Check if user is authenticated and token is valid
        if (token && !user) {
          const response = await apiService.getUserProfile();
          if (response.success && response.data) {
            useAuthStore.getState().setUser(response.data.user);
          } else {
            // Token is invalid, logout
            useAuthStore.getState().logout();
          }
        }

        // Connect to socket if authenticated
        if (isAuthenticated && token) {
          socketService.connect(token);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        useAuthStore.getState().logout();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token, isAuthenticated, user, setLoading]);

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              {!isAuthenticated ? (
                <>
                  <Route
                    path="/login"
                    element={
                      <AuthLayout>
                        <LoginPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <AuthLayout>
                        <RegisterPage />
                      </AuthLayout>
                    }
                  />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                /* Protected routes */
                <>
                  <Route
                    path="/"
                    element={
                      <MainLayout>
                        <ChatPage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <MainLayout>
                        <ChatPage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/chat/:roomId"
                    element={
                      <MainLayout>
                        <ChatPage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <MainLayout>
                        <WalletPage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/miniapps"
                    element={
                      <MainLayout>
                        <MiniAppsPage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <MainLayout>
                        <ProfilePage />
                      </MainLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    }
                  />
                  <Route path="*" element={<Navigate to="/chat" replace />} />
                </>
              )}
            </Routes>
          </div>
        </Router>
        
        {/* Global toast notifications */}
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;