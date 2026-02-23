import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookingStore } from '../../store/booking.store';
import { teacherSearchService } from '../../core/services/teacher-search.service';
import type { Teacher, TeacherSubject, TeacherAvailability } from '../../core/models/teacher.model';
import type { LocationType } from '../../core/models/booking.model';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Book,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Video,
  Users,
  Home,
} from 'lucide-react';

const STEPS = ['Select Subject', 'Select Time', 'Location', 'Confirm'];

const bookingSchema = z.object({
  teacher_subject_id: z.number({ message: 'Please select a subject' }),
  booking_date: z.string().min(1, 'Please select a date'),
  start_time: z.string().min(1, 'Please select a start time'),
  end_time: z.string().min(1, 'Please select an end time'),
  location_type: z.enum(['online', 'student_home', 'teacher_location', 'agreed_location'], {
    message: 'Please select a location type',
  }),
  location_address: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingCreatePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const { createBooking, isLoading } = useBookingStore();

  const [step, setStep] = useState(0);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedSubjectId = watch('teacher_subject_id');
  const selectedDate = watch('booking_date');
  const locationType = watch('location_type');

  useEffect(() => {
    if (teacherId) {
      Promise.all([
        teacherSearchService.getTeacherProfile(Number(teacherId)),
        teacherSearchService.getTeacherAvailability(Number(teacherId)),
      ])
        .then(([t, a]) => {
          setTeacher(t);
          setAvailabilities(a);
        })
        .finally(() => setLoadingTeacher(false));
    }
  }, [teacherId]);

  const selectedDateDOW = selectedDate ? new Date(selectedDate).getDay() : -1;
  const availableSlots = availabilities.filter(
    (a) => a.day_of_week === selectedDateDOW && a.is_active
  );
  const selectedSubject = teacher?.subjects?.find((s) => (s.id ?? s.subject_id) === selectedSubjectId);

  const nextStep = async () => {
    let valid = true;
    if (step === 0) valid = await trigger('teacher_subject_id');
    if (step === 1) valid = await trigger(['booking_date', 'start_time', 'end_time']);
    if (step === 2) valid = await trigger('location_type');
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      await createBooking({
        teacher_id: Number(teacherId),
        teacher_subject_id: data.teacher_subject_id,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time: data.end_time,
        location_type: data.location_type as LocationType,
        location_address: data.location_address || undefined,
        notes: data.notes || undefined,
      });
      navigate('/bookings');
    } catch {
      // error handled by store
    }
  };

  if (loadingTeacher) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500">Teacher not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-['Poppins'] text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] mb-2">
        Book a Session
      </h1>
      <p className="text-gray-500 mb-8">
        with {teacher.first_name} {teacher.last_name}
      </p>

      {/* Steps Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  i <= step
                    ? 'bg-[#131313] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`hidden sm:block text-sm font-['Poppins'] ${
                  i <= step ? 'text-[#131313]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i < step ? 'bg-[#131313]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Select Subject */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-['Poppins'] font-semibold text-xl mb-4 flex items-center gap-2">
              <Book className="w-5 h-5" /> Choose a Subject
            </h2>
            {teacher.subjects && teacher.subjects.length > 0 ? (
              <div className="grid gap-3">
                {teacher.subjects.map((subject) => (
                  <label
                    key={subject.id ?? subject.subject_id}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
                      selectedSubjectId === (subject.id ?? subject.subject_id)
                        ? 'border-[#131313] bg-gray-50 ring-2 ring-[#131313]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value={subject.id ?? subject.subject_id}
                        {...register('teacher_subject_id', { valueAsNumber: true })}
                        onChange={() => setValue('teacher_subject_id', subject.id ?? subject.subject_id)}
                        checked={selectedSubjectId === (subject.id ?? subject.subject_id)}
                        className="sr-only"
                      />
                      <div>
                        <p className="font-medium">{subject.subject_name}</p>
                        <p className="text-sm text-gray-400">{subject.grade_level_name}</p>
                      </div>
                    </div>
                    <span className="font-bold">{subject.effective_price} EGP/hr</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">This teacher has no subjects listed.</p>
            )}
            {errors.teacher_subject_id && (
              <p className="text-red-500 text-sm">{errors.teacher_subject_id.message}</p>
            )}
          </div>
        )}

        {/* Step 1: Select Time */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-['Poppins'] font-semibold text-xl mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Choose Date & Time
            </h2>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('booking_date')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#131313]"
              />
              {errors.booking_date && (
                <p className="text-red-500 text-sm mt-1">{errors.booking_date.message}</p>
              )}
            </div>

            {selectedDate && availableSlots.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium mb-2">Available slots:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <span key={slot.id} className="bg-white px-3 py-1 rounded-full text-sm text-green-700 border border-green-200">
                      {slot.start_time} – {slot.end_time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  {...register('start_time')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#131313]"
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  {...register('end_time')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#131313]"
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-['Poppins'] font-semibold text-xl mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Session Location
            </h2>

            <div className="grid gap-3">
              {[
                { value: 'online', icon: Video, label: 'Online Session', desc: 'Via video call' },
                { value: 'student_home', icon: Home, label: "Student's Home", desc: 'Teacher comes to you' },
                { value: 'teacher_location', icon: MapPin, label: "Teacher's Location", desc: "Go to the teacher" },
                { value: 'agreed_location', icon: Users, label: 'Agreed Location', desc: 'Meet at a chosen place' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    locationType === opt.value
                      ? 'border-[#131313] bg-gray-50 ring-2 ring-[#131313]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('location_type')}
                    className="sr-only"
                  />
                  <opt.icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-sm text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.location_type && (
              <p className="text-red-500 text-sm">{errors.location_type.message}</p>
            )}

            {locationType && locationType !== 'online' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address (optional)</label>
                <input
                  type="text"
                  {...register('location_address')}
                  placeholder="Enter address details"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#131313]"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-['Poppins'] font-semibold text-xl mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Confirm Booking
            </h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Teacher</span>
                <span className="font-medium">{teacher.first_name} {teacher.last_name}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Subject</span>
                <span className="font-medium">{selectedSubject?.subject_name || '—'}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{watch('booking_date')}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{watch('start_time')} – {watch('end_time')}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Location</span>
                <span className="font-medium capitalize">{watch('location_type')?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-lg">Estimated Price</span>
                <span className="font-bold text-lg">{selectedSubject?.effective_price || teacher.hourly_rate} EGP/hr</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
              <textarea
                {...register('notes')}
                placeholder="Any special requirements..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#131313] resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-['Poppins']"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-gray-800 transition font-['Poppins'] font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Confirm Booking
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
