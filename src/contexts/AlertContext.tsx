'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DeveloperNotice from "@/src/components/ui/DeveloperNotice";

interface ConfirmState {
  show: boolean;
  message: string;
  onConfirm?: () => void;
}

interface AlertState {
  show: boolean;
  message: string;
  success: boolean;
}

interface AlertContextType {
  showAlert: (message: string, success: boolean) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // State for the auto-hiding toast notifications
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    message: "",
    success: true,
  });

  // State for the blocking confirmation modal[cite: 3]
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    show: false,
    message: "",
  });

  // State for the yellow developer warning banner[cite: 3]
  const [showDevNotice, setShowDevNotice] = useState(true);

  // --- Global Event Listeners ---
  useEffect(() => {
    // Hide the developer notice after 10 seconds automatically
    const timer = setTimeout(() => setShowDevNotice(false), 10000);
    
    // Listen for the Axios interceptor firing a 401 Unauthorized
    const handleAuthChange = () => {
      showAlert("Session expired. Please log in again.", false);
      router.push("/auth/login");
    };

    window.addEventListener("auth-changed", handleAuthChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [router]);

  // --- Context Methods ---
  const showAlert = useCallback((message: string, success: boolean) => {
    setAlertState({ show: true, message, success });
    
    // Auto-dismiss the alert after 3 seconds (Toast behavior)
    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({ show: true, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, show: false }));
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    closeConfirm();
  }, [confirmState, closeConfirm]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* 1. The Global Developer Notice */}
      <DeveloperNotice isVisible={showDevNotice} />

      {/* 2. The Blocking Confirmation Dialog */}
      {confirmState.show && (
        <ConfirmDialog
          title={confirmState.message}
          onConfirm={handleConfirmAction}
          onCancel={closeConfirm}
        />
      )}

      {/* 3. The Non-Blocking Toast Alert */}
      {alertState.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-6 py-3 rounded-full shadow-lg border backdrop-blur-md font-medium text-sm ${
            alertState.success 
              ? "bg-primary/20 border-primary text-white" 
              : "bg-destructive/20 border-destructive text-destructive-foreground"
          }`}>
            {alertState.message}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}