'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useMyBookings } from '@/lib/hooks/useBookings';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm, BookingHistoryList } from '@/components/features/profile/ProfileComponents';
import { User, LogOut, Briefcase, Settings, Bell } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { data: bookings = [], isLoading: isLoadingBookings } = useMyBookings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-white border rounded-lg p-6 mb-4 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
              <User className="w-10 h-10" />
            </div>
            <h2 className="font-bold text-lg text-center">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500 text-center">{user.email}</p>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'bookings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              My Bookings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <hr className="my-2" />
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h1 className="text-xl font-bold">
                {activeTab === 'profile' ? 'Profile Information' : 'Booking History'}
              </h1>
            </div>
            <div className="p-6">
              {activeTab === 'profile' ? (
                <ProfileForm user={user as any} />
              ) : (
                <BookingHistoryList bookings={bookings as any} isLoading={isLoadingBookings} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
