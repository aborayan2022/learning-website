import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useBookingStore } from '../../store/booking.store';
import { useAuthStore } from '../../store/auth.store';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Video,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBooking, loadBooking, confirmBooking, cancelBooking, completeBooking, isLoading } =
    useBookingStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) loadBooking(Number(id));
  }, [id, loadBooking]);

  if (isLoading || !currentBooking) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const booking = currentBooking;
  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Poppins'] text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313]">
          Booking Details
        </h1>
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${
            STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Info Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Teacher</p>
                <p className="font-medium">{booking.teacher_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-medium">
                  {new Date(booking.booking_date).toLocaleDateString('en', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-medium">
                  {booking.start_time} – {booking.end_time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {booking.location_type === 'online' ? (
                <Video className="w-5 h-5 text-gray-400" />
              ) : (
                <MapPin className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium capitalize">
                  {booking.location_type.replace('_', ' ')}
                </p>
                {booking.location_address && (
                  <p className="text-sm text-gray-400">{booking.location_address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <p className="text-sm text-gray-400">Subject</p>
                <p className="font-medium">{booking.subject_name}</p>
              </div>
            </div>
            {booking.notes && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-1">Notes</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <span className="text-gray-500">Total Price</span>
          <span className="font-['Poppins'] font-bold text-2xl text-[#131313]">
            {booking.total_price} EGP
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        {/* Teacher can confirm pending bookings */}
        {booking.status === 'pending' && isTeacher && (
          <button
            onClick={() => confirmBooking(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-['Poppins'] font-medium"
          >
            <CheckCircle className="w-4 h-4" /> Confirm Booking
          </button>
        )}

        {/* Teacher can mark completed */}
        {booking.status === 'confirmed' && isTeacher && (
          <button
            onClick={() => completeBooking(booking.id)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-['Poppins'] font-medium"
          >
            <CheckCircle className="w-4 h-4" /> Mark Complete
          </button>
        )}

        {/* Both can cancel pending/confirmed */}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={() => cancelBooking(booking.id, 'Cancelled by user')}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-['Poppins'] font-medium"
          >
            <XCircle className="w-4 h-4" /> Cancel Booking
          </button>
        )}

        {/* Parent can pay for confirmed bookings */}
        {booking.status === 'confirmed' && isParent && (
          <Link
            to={`/payments/booking/${booking.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium"
          >
            Pay Now
          </Link>
        )}

        {/* Parent can review completed bookings */}
        {booking.status === 'completed' && isParent && (
          <Link
            to={`/reviews/create/${booking.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition font-['Poppins'] font-medium"
          >
            Leave Review
          </Link>
        )}
      </div>
    </div>
  );
}
