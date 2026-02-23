import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useTeacherStore } from '../../store/teacher.store';
import { useMapStore } from '../../store/map.store';
import { teacherSearchService } from '../../core/services/teacher-search.service';
import type { Subject, GradeLevel } from '../../core/models/teacher.model';
import { TeacherMap } from '../../components/map/TeacherMap';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Video,
  Users,
  Map,
  List,
} from 'lucide-react';

export default function TeacherSearchPage() {
  const {
    teachers,
    filters,
    isLoading,
    pagination,
    updateFilters,
    searchNearby,
  } = useTeacherStore();
  const { requestLocation, currentPosition } = useMapStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    // Load filter options
    teacherSearchService.getSubjects().then(setSubjects).catch(() => {});
    teacherSearchService.getGradeLevels().then(setGradeLevels).catch(() => {});

    // Get user location
    requestLocation().then((pos) => {
      useTeacherStore.getState().setUserLocation(pos.lat, pos.lng);
    });
  }, [requestLocation]);

  const radiusKm = Math.round(filters.radius / 1000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl text-[#131313] dark:text-white mb-2">
          {t('teachers.findPerfectTeacher')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
          {currentPosition
            ? t('teachers.showingNearLocation')
            : t('teachers.enableLocation')}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Subject Filter */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filters.subjectId || ''}
              onChange={(e) =>
                updateFilters({ subjectId: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#131313] dark:focus:ring-white font-['Poppins'] text-sm"
            >
              <option value="">{t('teachers.allSubjects')}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Grade Level Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={filters.gradeLevelId || ''}
              onChange={(e) =>
                updateFilters({ gradeLevelId: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#131313] dark:focus:ring-white font-['Poppins'] text-sm"
            >
              <option value="">{t('teachers.allGrades')}</option>
              {gradeLevels.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-['Poppins'] text-sm text-gray-700 dark:text-gray-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('teachers.filters')}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Radius */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 font-['Poppins'] mb-1">
                {t('teachers.radius')}: {radiusKm}km
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => updateFilters({ radius: Number(e.target.value) * 1000 })}
                className="w-full"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 font-['Poppins'] mb-1">
                {t('teachers.minRating')}
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) =>
                  updateFilters({ minRating: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-['Poppins'] text-sm"
              >
                <option value="">{t('teachers.any')}</option>
                <option value="3">3+ {t('teachers.stars')}</option>
                <option value="4">4+ {t('teachers.stars')}</option>
                <option value="4.5">4.5+ {t('teachers.stars')}</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 font-['Poppins'] mb-1">
                {t('teachers.maxPrice')}
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })
                }
                placeholder={t('teachers.any')}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-['Poppins'] text-sm"
              />
            </div>

            {/* Online Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.acceptsOnline === true}
                  onChange={(e) =>
                    updateFilters({ acceptsOnline: e.target.checked ? true : null })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-['Poppins']">{t('teachers.onlineOnly')}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins'] text-sm">
          {t('teachers.teachersFound', { count: pagination.total })}
          {radiusKm > 0 && ` ${t('teachers.withinKm', { km: radiusKm })}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-['Poppins'] transition ${
              viewMode === 'list'
                ? 'bg-[#131313] dark:bg-white text-white dark:text-[#131313]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            {t('teachers.listView')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-['Poppins'] transition ${
              viewMode === 'map'
                ? 'bg-[#131313] dark:bg-white text-white dark:text-[#131313]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Map className="w-4 h-4" />
            {t('teachers.mapView')}
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <TeacherMap
            onSelectTeacher={(teacherId) => navigate(`/teachers/${teacherId}`)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('teachers.noTeachersFound')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('teachers.tryExpandingSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Link
              key={teacher.id}
              to={`/teachers/${teacher.teacher_profile_id}`}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition group"
            >
              {/* Featured Badge */}
              {teacher.is_featured && (
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 text-center">
                  ⭐ FEATURED TEACHER
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">
                        {teacher.first_name[0]}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Poppins'] font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                      {teacher.first_name} {teacher.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-700 font-medium">
                        {teacher.avg_rating}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({teacher.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {teacher.city}, {teacher.governorate}
                      <span className="text-gray-400">· {teacher.distance_km}km</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {teacher.accepts_online && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      <Video className="w-3 h-3" /> Online
                    </span>
                  )}
                  {teacher.accepts_in_person && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                      <Users className="w-3 h-3" /> In Person
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {teacher.experience_years}+ years
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="font-['Poppins'] font-bold text-lg text-[#131313] dark:text-white">
                    {teacher.hourly_rate} EGP
                    <span className="text-sm font-normal text-gray-400">/hr</span>
                  </span>
                  <span className="text-sm text-blue-600 font-medium group-hover:underline">
                    View Profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => searchNearby(page)}
              className={`px-4 py-2 rounded-lg font-['Poppins'] text-sm transition ${
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
  );
}
