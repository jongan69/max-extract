import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateAccountModal } from "../components/CreateAccount";

const MainLayout: React.FC = () => {
  const wallet = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (wallet.connected && !hasOpened.current) {
      setModalOpen(true);
      hasOpened.current = true;
    }
    if (!wallet.connected) {
      hasOpened.current = false;
    }
  }, [wallet.connected]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onCreateAccount={() => setModalOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <CreateAccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default MainLayout;