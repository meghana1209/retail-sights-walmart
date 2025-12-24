import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

type Page = 'home' | 'login' | 'customer-login' | 'admin-login' | 'register' | 'dashboard' | 'cart' | 'orders' | 'analytics';

const AppContent = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [cartCount, setCartCount] = useState(0);

  // Redirect to dashboard when user logs in
  useEffect(() => {
    if (user && userRole && currentPage !== 'dashboard') {
      setCurrentPage('dashboard');
    }
  }, [user, userRole]);

  // Redirect to home when user logs out
  useEffect(() => {
    if (!user && currentPage === 'dashboard') {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    if (page === 'logout') {
      handleLogout();
      return;
    }
    
    // Handle role-specific navigation
    if (page === 'customer-login') {
      setCurrentPage('login');
      return;
    }
    
    if (page === 'admin-login') {
      setCurrentPage('login');
      return;
    }
    
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return (
          <LoginPage 
            onNavigate={handleNavigate}
            initialTab="customer"
          />
        );
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'dashboard':
        if (userRole === 'customer') {
          return <CustomerDashboard />;
        } else if (userRole === 'admin') {
          return <AdminDashboard />;
        }
        return <HomePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={userRole} 
        cartCount={cartCount}
        onNavigate={handleNavigate}
      />
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
