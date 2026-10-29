'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAdminPortal } from './hooks/use-admin-portal';
import { AdminAuthGate } from './admin-auth-gate';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { AdminPriceModal } from './modals/admin-price-modal';
import { AdminShippingModal } from './modals/admin-shipping-modal';

type AdminPortalState = ReturnType<typeof useAdminPortal>;

const AdminContext = createContext<AdminPortalState | null>(null);

export function useAdminPortalContext(): AdminPortalState {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminPortalContext must be used within an AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const portal = useAdminPortal();

  if (!portal.mounted) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  if (!portal.isAuthenticated) {
    return (
      <AdminAuthGate
        authStep={portal.authStep}
        username={portal.username}
        setUsername={portal.setUsername}
        password={portal.password}
        setPassword={portal.setPassword}
        pinInput={portal.pinInput}
        setPinInput={portal.setPinInput}
        pinError={portal.pinError}
        setPinError={portal.setPinError}
        handleLogin={portal.handleLogin}
      />
    );
  }

  return (
    <AdminContext.Provider value={portal}>
      <div className="min-h-screen bg-[#F6F7F6] text-brand-charcoal lg:flex">
        <AdminSidebar
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
          handleLogout={portal.handleLogout}
        />

        <div className="min-w-0 flex-1">
          <AdminHeader
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />

          <main className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-7 sm:px-8 sm:py-9">
            {children}
          </main>
        </div>

        {/* Global Modals for any admin sub-route */}
        <AdminPriceModal {...portal.priceModalProps} />
        <AdminShippingModal {...portal.shippingModalProps} />
      </div>
    </AdminContext.Provider>
  );
}
