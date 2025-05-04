import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;