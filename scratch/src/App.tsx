import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Core Pages ───
import LanguageSelect from './pages/LanguageSelect';
import RoleSelect from './pages/RoleSelect';
import CustomerAuth from './pages/CustomerAuth';
import BarberAuth from './pages/BarberAuth';
import CustomerProfileSetup from './pages/CustomerProfileSetup';
import BarberProfileSetup from './pages/BarberProfileSetup';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import SalonQRPage from './pages/SalonQRPage';
import SplashScreen from './components/SplashScreen';
import TokenNotificationListener from './components/TokenNotificationListener';
import Sidebar from './components/Sidebar';

// ─── Customer Discovery ───
import CommunityBoard from './pages/CommunityBoard';
import SupportChat from './pages/SupportChat';
import ReferralPage from './pages/ReferralPage';
import CustomerHome from './pages/CustomerHome';
import CustomerSearch from './pages/CustomerSearch';
import SalonDetail from './pages/SalonDetail';
import CustomerTokens from './pages/CustomerTokens';
import CustomerProfileEdit from './pages/CustomerProfileEdit';
import CustomerSubscription from './pages/CustomerSubscription';
import CustomerHairstyles from './pages/CustomerHairstyles';
import CustomerTryOn from './pages/CustomerTryOn';
import CustomerHistory from './pages/CustomerHistory';
import LoyaltyPage from './pages/LoyaltyPage';
import CustomerLoyalty from './pages/CustomerLoyalty';
import CustomerChat from './pages/CustomerChat';
import ConsultationRoom from './pages/ConsultationRoom';
import CartPage from './pages/CartPage';
import BusinessCompare from './pages/BusinessCompare';

// ─── Business / Partner Dashboard ───
import BarberHome from './pages/BarberHome';
import BarberDashboard from './pages/BarberDashboard';
import BarberProfile from './pages/BarberProfile';
import BarberCustomers from './pages/BarberCustomers';
import BarberAnalytics from './pages/BarberAnalytics';
import BarberMessages from './pages/BarberMessages';
import BarberSubscription from './pages/BarberSubscription';

// ─── Business Tools (Beauty-Relevant) ───
import TherapistCalendar from './pages/TherapistCalendar';
import DesignGalleryManager from './pages/DesignGalleryManager';
import UniversalStaffManager from './pages/UniversalStaffManager';
import DynamicTaxSettings from './pages/DynamicTaxSettings';
import InventoryLowAlerts from './pages/InventoryLowAlerts';
import MembershipRenewalBot from './pages/MembershipRenewalBot';
import SmartInventory from './pages/SmartInventory';
import BridalPackageBuilder from './pages/BridalPackageBuilder';
import DigitalConsentForm from './pages/DigitalConsentForm';
import UniversalFeedbackLoop from './pages/UniversalFeedbackLoop';
import UniversalReferralEngine from './pages/UniversalReferralEngine';
import DynamicPricing from './pages/DynamicPricing';
import CouponManager from './pages/CouponManager';
import AppointmentReminders from './pages/AppointmentReminders';
import BookingCalendar from './pages/BookingCalendar';
import InvoiceGenerator from './pages/InvoiceGenerator';
import ExpenseTracker from './pages/ExpenseTracker';
import CashRegister from './pages/CashRegister';
import StaffPayroll from './pages/StaffPayroll';
import StaffAttendance from './pages/StaffAttendance';
import ProductRetailPOS from './pages/ProductRetailPOS';
import WhatsAppCRM from './pages/WhatsAppCRM';
import CustomerCRM from './pages/CustomerCRM';
import LeadManager from './pages/LeadManager';
import UPIPayment from './pages/UPIPayment';
import MembershipDashboard from './pages/MembershipDashboard';
import GroomingChecklist from './pages/GroomingChecklist';
import SmartNotifications from './pages/SmartNotifications';
import LoyaltyProgramManager from './pages/LoyaltyProgramManager';
import TaskManager from './pages/TaskManager';
import ShiftPlanner from './pages/ShiftPlanner';
import BusinessAnalyticsPro from './pages/BusinessAnalyticsPro';
import ReferralProgram from './pages/ReferralProgram';
import DailyReportDashboard from './pages/DailyReportDashboard';
import DailyReportGenerator from './pages/DailyReportGenerator';
import CustomerFeedback from './pages/CustomerFeedback';
import ContractManager from './pages/ContractManager';
import SubscriptionManager from './pages/SubscriptionManager';
import BirthdayReminder from './pages/BirthdayReminder';
import MembershipCard from './pages/MembershipCard';
import HairstyleTryOn from './pages/HairstyleTryOn';
import SalonProductCatalog from './pages/SalonProductCatalog';
import FranchiseAuth from './pages/FranchiseAuth';
import FranchiseDashboard from './pages/FranchiseDashboard';
import FranchiseManager from './pages/FranchiseManager';
import MarketingDashboard from './pages/MarketingDashboard';
import TechnicianTracker from './pages/TechnicianTracker';
import ToolsGridPage from './pages/ToolsGridPage';
import TVDashboard from './pages/TVDashboard';
import MenuEditor from './pages/MenuEditor';
import RevenueOps from './pages/RevenueOps';

// ─── Beauty Niche Pages ───
import MassageTherapy from './pages/MassageTherapy';
import MehndiArtist from './pages/MehndiArtist';
import TattooStudio from './pages/TattooStudio';
import SpaWellness from './pages/SpaWellness';
import AcupunctureClinic from './pages/AcupunctureClinic';
import AyurvedicCenter from './pages/AyurvedicCenter';
import AyurvedaClinic from './pages/AyurvedaClinic';
import CustomerPets from './pages/CustomerPets';

// ─── NEW: Sprint 1-8 Feature Pages ───
import Achievements from './pages/Achievements';
import RewardsCenter from './pages/RewardsCenter';
import Wallet from './pages/Wallet';
import GiftCards from './pages/GiftCards';

const OWNER_EMAIL = 'satyamkumar56021@gmail.com';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user.email !== OWNER_EMAIL) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'customer' | 'business' }) {
  const { user, role, loading } = useApp();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto animate-pulse shadow-2xl">
        <span className="text-3xl font-black text-white">L</span>
      </div>
    </div>
  );
  if (!user) {
    if (requiredRole === 'customer') return <Navigate to="/customer/auth" replace />;
    if (requiredRole === 'business') return <Navigate to="/barber/auth" replace />;
    return <Navigate to="/" replace />;
  }
  if (role !== requiredRole) return <Navigate to="/role" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useApp();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl border border-white/20">
          <span className="text-4xl font-black text-white">L</span>
        </div>
        <h1 className="text-2xl font-black text-text tracking-[0.2em] uppercase">Line Free India</h1>
        <p className="text-text-dim mt-4 text-[10px] font-black uppercase tracking-[4px]">Syncing Universe...</p>
      </div>
    </div>
  );

  const isBusinessRoute = location.pathname.startsWith('/barber') ||
    location.pathname.startsWith('/franchise') ||
    location.pathname.startsWith('/beauty');

  return (
    <div className={isBusinessRoute ? 'business-layout scroll-viewport' : 'scroll-viewport'}>
      <Sidebar />
      <PageTransition>
        <Routes>
          <Route path="/" element={<LanguageSelect />} />
          <Route path="/role" element={<RoleSelect />} />

          <Route path="/customer/community/:id" element={<CommunityBoard />} />
          <Route path="/customer/support" element={<SupportChat />} />
          <Route path="/customer/refer" element={<ReferralPage />} />
          <Route path="/customer/auth" element={<CustomerAuth />} />
          <Route path="/barber/auth" element={<BarberAuth />} />
          <Route path="/customer/setup" element={<CustomerProfileSetup />} />
          <Route path="/barber/setup" element={<BarberProfileSetup />} />
          <Route path="/salon/:id/qr" element={<SalonQRPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

          {/* ═══ Customer Side ═══ */}
          <Route path="/customer/home" element={<AuthGuard requiredRole="customer"><CustomerHome /></AuthGuard>} />
          <Route path="/customer/search" element={<AuthGuard requiredRole="customer"><CustomerSearch /></AuthGuard>} />
          <Route path="/customer/salon/:id" element={<AuthGuard requiredRole="customer"><SalonDetail /></AuthGuard>} />
          <Route path="/customer/tokens" element={<AuthGuard requiredRole="customer"><CustomerTokens /></AuthGuard>} />
          <Route path="/customer/profile" element={<AuthGuard requiredRole="customer"><CustomerProfileEdit /></AuthGuard>} />
          <Route path="/customer/subscription" element={<AuthGuard requiredRole="customer"><CustomerSubscription /></AuthGuard>} />
          <Route path="/customer/hairstyles" element={<AuthGuard requiredRole="customer"><CustomerHairstyles /></AuthGuard>} />
          <Route path="/customer/try-on" element={<AuthGuard requiredRole="customer"><CustomerTryOn /></AuthGuard>} />
          <Route path="/customer/history" element={<AuthGuard requiredRole="customer"><CustomerHistory /></AuthGuard>} />
          <Route path="/customer/loyalty" element={<AuthGuard requiredRole="customer"><LoyaltyPage /></AuthGuard>} />
          <Route path="/customer/loyalty/:businessId" element={<AuthGuard requiredRole="customer"><CustomerLoyalty /></AuthGuard>} />
          <Route path="/customer/chat/:salonId" element={<AuthGuard requiredRole="customer"><CustomerChat /></AuthGuard>} />
          <Route path="/customer/notifications" element={<AuthGuard requiredRole="customer"><NotificationsPage /></AuthGuard>} />
          <Route path="/customer/consultation/:id" element={<AuthGuard requiredRole="customer"><ConsultationRoom /></AuthGuard>} />
          <Route path="/customer/cart" element={<AuthGuard requiredRole="customer"><CartPage /></AuthGuard>} />
          <Route path="/customer/pets" element={<AuthGuard requiredRole="customer"><CustomerPets /></AuthGuard>} />
          <Route path="/customer/achievements" element={<AuthGuard requiredRole="customer"><Achievements /></AuthGuard>} />
          <Route path="/customer/rewards" element={<AuthGuard requiredRole="customer"><RewardsCenter /></AuthGuard>} />
          <Route path="/customer/wallet" element={<AuthGuard requiredRole="customer"><Wallet /></AuthGuard>} />
          <Route path="/customer/gift-cards" element={<AuthGuard requiredRole="customer"><GiftCards /></AuthGuard>} />
          <Route path="/customer/compare" element={<AuthGuard requiredRole="customer"><BusinessCompare /></AuthGuard>} />

          {/* ═══ Business / Partner Side ═══ */}
          <Route path="/barber/home" element={<AuthGuard requiredRole="business"><BarberHome /></AuthGuard>} />
          <Route path="/barber/dashboard" element={<AuthGuard requiredRole="business"><BarberDashboard /></AuthGuard>} />
          <Route path="/barber/profile" element={<AuthGuard requiredRole="business"><BarberProfile /></AuthGuard>} />
          <Route path="/barber/customers" element={<AuthGuard requiredRole="business"><BarberCustomers /></AuthGuard>} />
          <Route path="/barber/analytics" element={<AuthGuard requiredRole="business"><BarberAnalytics /></AuthGuard>} />
          <Route path="/barber/subscription" element={<AuthGuard requiredRole="business"><BarberSubscription /></AuthGuard>} />
          <Route path="/barber/messages" element={<AuthGuard requiredRole="business"><BarberMessages /></AuthGuard>} />
          <Route path="/barber/notifications" element={<AuthGuard requiredRole="business"><NotificationsPage /></AuthGuard>} />
          <Route path="/barber/qr" element={<AuthGuard requiredRole="business"><SalonQRPage id="own" /></AuthGuard>} />

          {/* ═══ Business Tools (Beauty OS) ═══ */}
          <Route path="/barber/therapist-calendar" element={<AuthGuard requiredRole="business"><TherapistCalendar /></AuthGuard>} />
          <Route path="/barber/gallery" element={<AuthGuard requiredRole="business"><DesignGalleryManager /></AuthGuard>} />
          <Route path="/barber/staff" element={<AuthGuard requiredRole="business"><UniversalStaffManager /></AuthGuard>} />
          <Route path="/barber/tax" element={<AuthGuard requiredRole="business"><DynamicTaxSettings /></AuthGuard>} />
          <Route path="/barber/inventory-alerts" element={<AuthGuard requiredRole="business"><InventoryLowAlerts /></AuthGuard>} />
          <Route path="/barber/membership-bot" element={<AuthGuard requiredRole="business"><MembershipRenewalBot /></AuthGuard>} />
          <Route path="/barber/inventory" element={<AuthGuard requiredRole="business"><SmartInventory /></AuthGuard>} />
          <Route path="/barber/bridal-packages" element={<AuthGuard requiredRole="business"><BridalPackageBuilder /></AuthGuard>} />
          <Route path="/barber/consent-forms" element={<AuthGuard requiredRole="business"><DigitalConsentForm /></AuthGuard>} />
          <Route path="/barber/feedback" element={<AuthGuard requiredRole="business"><UniversalFeedbackLoop /></AuthGuard>} />
          <Route path="/barber/referrals" element={<AuthGuard requiredRole="business"><UniversalReferralEngine /></AuthGuard>} />
          <Route path="/barber/pricing" element={<AuthGuard requiredRole="business"><DynamicPricing /></AuthGuard>} />
          <Route path="/barber/coupons" element={<AuthGuard requiredRole="business"><CouponManager /></AuthGuard>} />
          <Route path="/barber/reminders" element={<AuthGuard requiredRole="business"><AppointmentReminders /></AuthGuard>} />
          <Route path="/barber/calendar" element={<AuthGuard requiredRole="business"><BookingCalendar /></AuthGuard>} />
          <Route path="/barber/invoices" element={<AuthGuard requiredRole="business"><InvoiceGenerator /></AuthGuard>} />
          <Route path="/barber/expenses" element={<AuthGuard requiredRole="business"><ExpenseTracker /></AuthGuard>} />
          <Route path="/barber/cash-register" element={<AuthGuard requiredRole="business"><CashRegister /></AuthGuard>} />
          <Route path="/barber/payroll" element={<AuthGuard requiredRole="business"><StaffPayroll /></AuthGuard>} />
          <Route path="/barber/attendance" element={<AuthGuard requiredRole="business"><StaffAttendance /></AuthGuard>} />
          <Route path="/barber/pos" element={<AuthGuard requiredRole="business"><ProductRetailPOS /></AuthGuard>} />
          <Route path="/barber/whatsapp" element={<AuthGuard requiredRole="business"><WhatsAppCRM /></AuthGuard>} />
          <Route path="/barber/crm" element={<AuthGuard requiredRole="business"><CustomerCRM /></AuthGuard>} />
          <Route path="/barber/leads" element={<AuthGuard requiredRole="business"><LeadManager /></AuthGuard>} />
          <Route path="/barber/memberships" element={<AuthGuard requiredRole="business"><MembershipDashboard /></AuthGuard>} />
          <Route path="/barber/grooming-checklist" element={<AuthGuard requiredRole="business"><GroomingChecklist /></AuthGuard>} />
          <Route path="/barber/smart-notifications" element={<AuthGuard requiredRole="business"><SmartNotifications /></AuthGuard>} />
          <Route path="/barber/loyalty-program" element={<AuthGuard requiredRole="business"><LoyaltyProgramManager /></AuthGuard>} />
          <Route path="/barber/tasks" element={<AuthGuard requiredRole="business"><TaskManager /></AuthGuard>} />
          <Route path="/barber/shifts" element={<AuthGuard requiredRole="business"><ShiftPlanner /></AuthGuard>} />
          <Route path="/barber/analytics-pro" element={<AuthGuard requiredRole="business"><BusinessAnalyticsPro /></AuthGuard>} />
          <Route path="/barber/referral-program" element={<AuthGuard requiredRole="business"><ReferralProgram /></AuthGuard>} />
          <Route path="/barber/daily-report" element={<AuthGuard requiredRole="business"><DailyReportDashboard /></AuthGuard>} />
          <Route path="/barber/reports" element={<AuthGuard requiredRole="business"><DailyReportDashboard /></AuthGuard>} />
          <Route path="/barber/tools" element={<AuthGuard requiredRole="business"><ToolsGridPage /></AuthGuard>} />
          <Route path="/barber/report-gen" element={<AuthGuard requiredRole="business"><DailyReportGenerator /></AuthGuard>} />
          <Route path="/barber/customer-feedback" element={<AuthGuard requiredRole="business"><CustomerFeedback /></AuthGuard>} />
          <Route path="/barber/contracts" element={<AuthGuard requiredRole="business"><ContractManager /></AuthGuard>} />
          <Route path="/barber/subscription-mgr" element={<AuthGuard requiredRole="business"><SubscriptionManager /></AuthGuard>} />
          <Route path="/barber/birthdays" element={<AuthGuard requiredRole="business"><BirthdayReminder /></AuthGuard>} />
          <Route path="/barber/membership-card" element={<AuthGuard requiredRole="business"><MembershipCard /></AuthGuard>} />
          <Route path="/barber/hairstyle-tryon" element={<AuthGuard requiredRole="business"><HairstyleTryOn /></AuthGuard>} />
          <Route path="/barber/products" element={<AuthGuard requiredRole="business"><SalonProductCatalog /></AuthGuard>} />
          <Route path="/barber/marketing" element={<AuthGuard requiredRole="business"><MarketingDashboard /></AuthGuard>} />
          <Route path="/barber/technician-tracker" element={<AuthGuard requiredRole="business"><TechnicianTracker /></AuthGuard>} />
          <Route path="/barber/tv-dashboard" element={<AuthGuard requiredRole="business"><TVDashboard /></AuthGuard>} />
          <Route path="/barber/menu-editor" element={<AuthGuard requiredRole="business"><MenuEditor /></AuthGuard>} />
          <Route path="/barber/revenue-ops" element={<AuthGuard requiredRole="business"><RevenueOps /></AuthGuard>} />

          {/* ═══ Franchise ═══ */}
          <Route path="/franchise/auth" element={<FranchiseAuth />} />
          <Route path="/franchise/dashboard" element={<AuthGuard requiredRole="business"><FranchiseDashboard /></AuthGuard>} />
          <Route path="/franchise/manager" element={<AuthGuard requiredRole="business"><FranchiseManager /></AuthGuard>} />

          {/* ═══ Beauty Niche Pages ═══ */}
          <Route path="/beauty/massage" element={<AuthGuard requiredRole="business"><MassageTherapy /></AuthGuard>} />
          <Route path="/beauty/mehndi" element={<AuthGuard requiredRole="business"><MehndiArtist /></AuthGuard>} />
          <Route path="/beauty/tattoo" element={<AuthGuard requiredRole="business"><TattooStudio /></AuthGuard>} />
          <Route path="/beauty/spa" element={<AuthGuard requiredRole="business"><SpaWellness /></AuthGuard>} />
          <Route path="/beauty/acupuncture" element={<AuthGuard requiredRole="business"><AcupunctureClinic /></AuthGuard>} />
          <Route path="/beauty/ayurveda" element={<AuthGuard requiredRole="business"><AyurvedicCenter /></AuthGuard>} />
          <Route path="/beauty/ayurveda-clinic" element={<AuthGuard requiredRole="business"><AyurvedaClinic /></AuthGuard>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <TokenNotificationListener />
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
