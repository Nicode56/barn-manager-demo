import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/Navigation";

// Demo pages (you'll implement these as simple, click-through UIs)
import { DemoHome } from "@/pages/demo/DemoHome"; // corkboard-style main page
import { ManagerDashboard } from "@/pages/demo/ManagerDashboard";
import { StaffDashboard } from "@/pages/demo/StaffDashboard";
import { ClientDashboard } from "@/pages/demo/ClientDashboard";

import { FarmMapPage } from "@/pages/demo/FarmMapPage";
import { AnimalListPage } from "@/pages/demo/AnimalListPage";
import { AnimalDetailPage } from "@/pages/demo/AnimalDetailPage";
import { HealthSchedulePage } from "@/pages/demo/HealthSchedulePage";
import { LessonSchedulePage } from "@/pages/demo/LessonSchedulePage";
import { MaintenanceBoardPage } from "@/pages/demo/MaintenanceBoardPage";
import { ComingSoonPage } from "@/pages/demo/ComingSoonPage";

import { NotFound } from "@/pages/NotFound";

import "./App.css";
import { DemoRoleRouter } from "./pages/demo/DemoRoleRouter";

export type UserRole = "barn_manager" | "barn_staff" | "client";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="barn-manager-theme">
      <LanguageProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-background western-theme">
              <Navigation />

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

                {/* Maintenance orders: create, schedule, mark complete, client notifications */}
                <Route path="/maintenance" element={<MaintenanceBoardPage />} />

                {/* Lesson scheduling: time slots, horse selection, notes */}
                <Route path="/lessons" element={<LessonSchedulePage />} />

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

            <Toaster />
          </Router>
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;