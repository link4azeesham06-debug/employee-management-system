import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import { AuditProvider } from "@/context/AuditContext";
import AppShell from "@/components/layout/AppShell";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { DepartmentProvider } from "@/context/DepartmentContext";

export const metadata: Metadata = {
  title: "HR | HR Management System",
  description:
    "A secure HR management workspace for employee records, departments, reporting, audit history, and notifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <AuditProvider>
              <EmployeeProvider>
                <DepartmentProvider>
                  <Toaster position="top-right" />
                  <AppShell>{children}</AppShell>
                </DepartmentProvider>
              </EmployeeProvider>
            </AuditProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
