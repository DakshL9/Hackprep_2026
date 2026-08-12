'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import AIAnalystChat from '@/components/AIAnalystChat';
import TransactionModal from '@/components/TransactionModal';

export default function AIAnalystPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        onAddTransaction={() => setModalOpen(true)}
      />

      <main className="p-6 max-w-5xl mx-auto w-full">
        <AIAnalystChat />
      </main>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
