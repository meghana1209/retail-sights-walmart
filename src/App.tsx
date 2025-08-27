import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";

const queryClient = new QueryClient();

type UserRole = 'customer' | 'admin' | null;
type Page = 'home' | 'login' | 'customer-login' | 'admin-login' | 'register' | 'dashboard' | 'cart' | 'orders' | 'analytics';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [cartCount, setCartCount] = useState(0);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
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
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        const initialTab = currentPage === 'login' ? 'customer' : 'admin';
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onNavigate={handleNavigate}
            initialTab={initialTab}
          />
        );
      case 'register':
        return <RegisterPage onRegister={() => setCurrentPage('login')} onNavigate={handleNavigate} />;
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
