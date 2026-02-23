import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../../../store/auth.store';
import { useBookingStore } from '../../../store/booking.store';
import { teacherProfileService } from '../../../core/services/teacher-profile.service';
import { subscriptionService } from '../../../core/services/subscription.service';
import type { TeacherSubscription } from '../../../core/models/subscription.model';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Settings,
  ChevronRight,
  ShieldCheck,
  Loader2,
  BookOpen,
  Star,
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { upcomingBookings, loadUpcomingBookings } = useBookingStore();
  const [subscription, setSubscription] = useState<TeacherSubscription | null>(null);

  useEffect(() => {
    loadUpcomingBookings();
    subscriptionService.getCurrentSubscription().then(setSubscription).catch(() => {});
  }, [loadUpcomingBookings]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313]">
          Teacher Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-['Poppins']">Welcome, {user?.first_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-[#131313]">{upcomingBookings.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-500">Rating</span>
          </div>
          <p className="text-2xl font-bold text-[#131313]">
            {(user as any)?.teacherProfile?.avg_rating || '—'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-[#131313]">
            {(user as any)?.teacherProfile?.total_bookings || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">Plan</span>
          </div>
          <p className="text-2xl font-bold text-[#131313] capitalize">
            {subscription?.plan?.name || 'Free'}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          to="/dashboard/teacher/profile"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <Settings className="w-6 h-6 text-gray-500" />
          <div>
            <p className="font-['Poppins'] font-semibold">Edit Profile</p>
            <p className="text-sm text-gray-400">Manage subjects & availability</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>

        <Link
          to="/bookings"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <BookOpen className="w-6 h-6 text-gray-500" />
          <div>
            <p className="font-['Poppins'] font-semibold">Bookings</p>
            <p className="text-sm text-gray-400">Manage your sessions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>

        <Link
          to="/plans"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <DollarSign className="w-6 h-6 text-gray-500" />
          <div>
            <p className="font-['Poppins'] font-semibold">Subscription</p>
            <p className="text-sm text-gray-400">Upgrade your plan</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-['Poppins'] font-semibold text-lg">Upcoming Sessions</h2>
          <Link to="/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No upcoming sessions</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400 uppercase">
                    {new Date(booking.booking_date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">{new Date(booking.booking_date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.parent_name || 'Student'}</p>
                  <p className="text-sm text-gray-400">{booking.subject_name}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  {booking.start_time}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {booking.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
