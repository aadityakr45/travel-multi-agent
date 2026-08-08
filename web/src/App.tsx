import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/layouts/AppShell"
import { AuthLayout } from "@/layouts/AuthLayout"
import { InfoLayout } from "@/layouts/InfoLayout"
import { TripPage } from "@/routes/trips/TripPage"
import { HistoryPage } from "@/routes/history/HistoryPage"
import { SettingsPage } from "@/routes/settings/SettingsPage"
import { LoginPage } from "@/routes/auth/LoginPage"
import { SignupPage } from "@/routes/auth/SignupPage"
import { NotFoundPage } from "@/routes/not-found/NotFoundPage"
import { HowItWorksPage } from "@/routes/info/HowItWorksPage"
import { AboutPage } from "@/routes/info/AboutPage"
import { PrivacyPage } from "@/routes/info/PrivacyPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/trips/new" replace />} />
          <Route path="trips/new" element={<TripPage />} />
          <Route path="trips/:threadId" element={<TripPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
        <Route element={<InfoLayout />}>
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
