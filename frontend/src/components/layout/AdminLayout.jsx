import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-column surface-ground">
      <Navbar />
      <div className="flex flex-1 justify-content-center">
        <main className="flex-1 max-w-7xl w-full p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
