import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../../../store/auth.store';
import { useBookingStore } from '../../../store/booking.store';
import {
  Calendar,
  Clock,
  Search,
  BookOpen,
  Star,
  ChevronRight,
} from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const { upcomingBookings, loadUpcomingBookings, isLoading } = useBookingStore();

  useEffect(() => {
    loadUpcomingBookings();
  }, [loadUpcomingBookings]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313]">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500 mt-1 font-['Poppins']">Here's your learning overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/teachers"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-['Poppins'] font-semibold">Find Teachers</p>
            <p className="text-sm text-gray-400">Search nearby tutors</p>
          </div>
        </Link>

        <Link
          to="/bookings"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-['Poppins'] font-semibold">My Bookings</p>
            <p className="text-sm text-gray-400">View all sessions</p>
          </div>
        </Link>

        <Link
          to="/plans"
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-['Poppins'] font-semibold">Subscription</p>
            <p className="text-sm text-gray-400">Manage your plan</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-['Poppins'] font-semibold text-lg">Upcoming Sessions</h2>
          <Link to="/bookings" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming sessions</p>
            <Link to="/teachers" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              Find a teacher →
            </Link>
          </div>
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
                  <p className="font-medium truncate">{booking.teacher_name}</p>
                  <p className="text-sm text-gray-400">{booking.subject_name}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  {booking.start_time}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
