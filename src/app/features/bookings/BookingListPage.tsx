import { useEffect } from 'react';
import { Link } from 'react-router';
import { useBookingStore } from '../../store/booking.store';
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  ChevronRight,
  Video,
  Users,
  Home,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

const LOCATION_ICONS: Record<string, typeof Video> = {
  online: Video,
  student_home: Home,
  teacher_location: MapPin,
  agreed_location: Users,
};

export default function BookingListPage() {
  const { bookings, isLoading, pagination, loadBookings } = useBookingStore();

  useEffect(() => {
    loadBookings({ page: 1 });
  }, [loadBookings]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] mb-6">
        My Bookings
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">Find a teacher and book your first session</p>
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium"
          >
            Find Teachers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const LocIcon = LOCATION_ICONS[booking.location_type] || MapPin;
            return (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
              >
                {/* Date Badge */}
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-gray-400 uppercase">
                    {new Date(booking.booking_date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-[#131313]">
                    {new Date(booking.booking_date).getDate()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-['Poppins'] font-semibold text-gray-900 truncate">
                      {booking.teacher_name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{booking.subject_name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.start_time} – {booking.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <LocIcon className="w-3 h-3" />
                      {booking.location_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Price & Arrow */}
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#131313]">{booking.total_price} EGP</span>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition ml-auto mt-1" />
                </div>
              </Link>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => loadBookings({ page })}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    page === pagination.page
                      ? 'bg-[#131313] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
