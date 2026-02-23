import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useTeacherStore } from '../../store/teacher.store';
import { useAuthStore } from '../../store/auth.store';
import { teacherSearchService } from '../../core/services/teacher-search.service';
import type { Review } from '../../core/models/payment.model';
import {
  Star,
  MapPin,
  Clock,
  Video,
  Users,
  Award,
  ChevronLeft,
  Calendar,
  Loader2,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTeacher, loadTeacherProfile, isLoading } = useTeacherStore();
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'availability'>('about');

  useEffect(() => {
    if (id) {
      loadTeacherProfile(Number(id));
      teacherSearchService
        .getTeacherReviews(Number(id))
        .then((r) => setReviews(r.data))
        .catch(() => {});
    }
  }, [id, loadTeacherProfile]);

  if (isLoading || !selectedTeacher) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const teacher = selectedTeacher;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Poppins'] text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to results
      </button>

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        {teacher.is_featured && (
          <div className="mb-4 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <Award className="w-4 h-4" /> Featured Teacher
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {teacher.avatar_url ? (
              <img src={teacher.avatar_url} alt={teacher.first_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {teacher.first_name[0]}{teacher.last_name[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313]">
              {teacher.first_name} {teacher.last_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{teacher.avg_rating}</span>
                <span className="text-gray-400">({teacher.total_reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                {teacher.city}, {teacher.governorate}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                {teacher.experience_years}+ years experience
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <GraduationCap className="w-4 h-4" />
                {teacher.total_bookings} sessions
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {teacher.accepts_online && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <Video className="w-4 h-4" /> Online Sessions
                </span>
              )}
              {teacher.accepts_in_person && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <Users className="w-4 h-4" /> In-Person
                </span>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="sm:text-right shrink-0">
            <div className="font-['Poppins'] font-bold text-3xl text-[#131313]">
              {teacher.hourly_rate} EGP
            </div>
            <div className="text-gray-400 text-sm">per hour</div>
            {isAuthenticated ? (
              <Link
                to={`/bookings/create/${teacher.user_id}`}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium"
              >
                Login to Book
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(['about', 'reviews', 'availability'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-['Poppins'] font-medium capitalize transition border-b-2 ${
                activeTab === tab
                  ? 'text-[#131313] border-[#131313]'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-['Poppins'] font-semibold text-lg mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {teacher.bio || 'No bio provided yet.'}
              </p>
            </div>

            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-['Poppins'] font-semibold text-lg mb-3">Subjects</h2>
                <div className="space-y-3">
                  {teacher.subjects.map((subject) => (
                    <div
                      key={`${subject.subject_id}-${subject.grade_level_id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{subject.subject_name}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          · {subject.grade_level_name}
                        </span>
                      </div>
                      <span className="font-semibold">{subject.effective_price} EGP/hr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-['Poppins'] font-semibold text-lg mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {teacher.avg_rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reviews</span>
                  <span className="font-medium">{teacher.total_reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sessions</span>
                  <span className="font-medium">{teacher.total_bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{teacher.experience_years} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="font-medium">{teacher.distance_km} km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                    {review.reviewer_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{review.reviewer_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm ml-auto">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                {(review.teaching_quality || review.punctuality || review.communication) && (
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    {review.teaching_quality && (
                      <span>Teaching: {review.teaching_quality}/5</span>
                    )}
                    {review.punctuality && <span>Punctuality: {review.punctuality}/5</span>}
                    {review.communication && (
                      <span>Communication: {review.communication}/5</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg mb-4">Weekly Availability</h2>
          {teacher.availabilities && teacher.availabilities.length > 0 ? (
            <div className="space-y-3">
              {DAYS.map((day, index) => {
                const slots = teacher.availabilities?.filter(
                  (a) => a.day_of_week === index && a.is_active
                );
                return (
                  <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                    <span className="w-28 font-medium text-gray-700">{day}</span>
                    {slots && slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <span
                            key={slot.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {slot.start_time} - {slot.end_time}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not available</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Availability not set yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
