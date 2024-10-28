import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const response = await fetch('https://moapay.moda.boutique/check/admin/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: 'goukun', 
            password: 'oneboat' 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setToken(data.token);
        toast.success('Login successful');
        navigate('/admin');
      } catch (err) {
        console.error('Auto-login failed:', err);
        toast.error('Login failed. Please try again.');
      }
    };

    autoLogin();
  }, [navigate, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-white">Logging in...</p>
      </div>
    </div>
  );
};

export default AdminLogin;