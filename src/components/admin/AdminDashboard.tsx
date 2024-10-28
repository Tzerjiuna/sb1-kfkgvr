import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Settings as SettingsIcon, Users, Hash, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import Addresses from './Addresses';
import Transactions from './Transactions';
import Withdrawals from './Withdrawals';
import SettingsPage from './Settings';
import Sidebar from './Sidebar';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: Users, label: t('addresses'), path: '/admin' },
    { icon: Hash, label: t('transactions'), path: '/admin/transactions' },
    { icon: Send, label: t('withdrawals'), path: '/admin/withdrawals' },
    { icon: SettingsIcon, label: t('settings'), path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar
        menuItems={menuItems}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 overflow-hidden">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Addresses />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;