import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DemoAuthProvider, type DemoUserRole } from "./contexts/DemoAuthContext";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Navigation } from "./components/Navigation";
import { Toaster } from "sonner";

// Demo pages (you'll implement these as simple, click-through UIs)
import { DemoHome } from "./pages/DemoHome"; // corkboard-style main page
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { ClientDashboard } from "./pages/ClientDashboard";

import FarmMapPage from "./pages/FarmMapPage";
import { AnimalListPage } from "./pages/AnimalListPage";
import { AnimalDetailPage } from "./pages/AnimalDetailPage";
import { HealthSchedulePage } from "./pages/HealthSchedulePage";
import { LessonSchedulePage } from "./pages/LessonSchedulePage";
import { MaintenanceBoardPage } from "./pages/MaintenanceBoardPage";
import { AnimalMaintenancePage } from "./pages/AnimalMaintenancePage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { BillingPage } from "./pages/BillingPage";
import { MessagingPage } from "./pages/MessagingPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { FeedOrderPage } from "./pages/FeedOrderPage";
import  BarnPage  from "./pages/BarnPage";

import { NotFound } from "./pages/NotFound";

import "./App.css";
import { DemoRoleRouter } from "./pages/demo/DemoRoleRouter";
import { Provider } from "react-redux";
import { store } from "./store/store";

export type UserRole = DemoUserRole;

function App() {
  return (
    <DemoAuthProvider>
      <Provider store={store}>
        <LoadingOverlay />

        <Router>
          <div className="min-h-screen bg-background western-theme">
            <Navigation />

            <div className="app-content">
            <Routes>
              <Route path="/" element={<DemoHome />} />
              <Route path="/demo/:role" element={<DemoRoleRouter />} />

              {/* Role-specific dashboards */}
              <Route path="/demo/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/demo/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/demo/client/dashboard" element={<ClientDashboard />} />

              {/* Shared core features */}
              {/* Low feed alerts, animal list, client profiles linked to horses */}
              <Route path="/animals" element={<AnimalListPage />} />
              <Route path="/animals/:animalId" element={<AnimalDetailPage />} />

              {/* Health & maintenance scheduling (vet, dentist, farrier, etc.) */}
              <Route path="/health-schedule" element={<HealthSchedulePage />} />

              {/* Farm mapping: pastures, stalls, labels */}
              <Route path="/farm-map" element={<FarmMapPage />} />
              <Route path="/barns/:barnId" element={<BarnPage />} />

              {/* Animal-specific maintenance (farrier, vet, dental, owner relay notes) */}
              <Route path="/animal-maintenance" element={<AnimalMaintenancePage />} />

              {/* Maintenance orders: create, schedule, mark complete, client notifications */}
              <Route path="/maintenance" element={<MaintenanceBoardPage />} />

              {/* Lesson scheduling: time slots, horse selection, notes */}
              <Route path="/lessons" element={<LessonSchedulePage />} />
              {/* Advanced features (mocked for demo) */}
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/messaging" element={<MessagingPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/feed-order" element={<FeedOrderPage />} />
              {/* “Coming soon” complex features (QuickBooks, direct messaging, etc.) */}
              <Route
                path="/coming-soon"
                element={
                  <ComingSoonPage
                    features={[
                      "QuickBooks integration for automated invoicing and accounting",
                      "Direct messaging between managers, staff, and clients",
                      "In-app notifications and chat channels",
                    ]}
                  />
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </div>

          <Toaster />
        </Router>
      </Provider>
    </DemoAuthProvider>
  );
}

export default App;