import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminService } from '../../../core/services/admin.service';
import {
  Users,
  BookOpen,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_teachers: number;
  total_bookings: number;
  total_revenue: number;
  pending_verifications: number;
  active_subscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then((data: DashboardStats) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-[#131313] mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-500" />}
          label="Total Users"
          value={stats?.total_users ?? 0}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<ShieldCheck className="w-6 h-6 text-purple-500" />}
          label="Teachers"
          value={stats?.total_teachers ?? 0}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-green-500" />}
          label="Total Bookings"
          value={stats?.total_bookings ?? 0}
          bg="bg-green-50"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          label="Revenue (EGP)"
          value={stats?.total_revenue ?? 0}
          bg="bg-yellow-50"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          label="Pending Verifications"
          value={stats?.pending_verifications ?? 0}
          bg="bg-orange-50"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-teal-500" />}
          label="Active Subscriptions"
          value={stats?.active_subscriptions ?? 0}
          bg="bg-teal-50"
        />
      </div>

      {/* Quick Admin Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminLink
          href="/admin/users"
          icon={<Users className="w-5 h-5" />}
          title="User Management"
          desc="View and manage all users"
        />
        <AdminLink
          href="/admin/verifications"
          icon={<CheckCircle className="w-5 h-5" />}
          title="Verification Queue"
          desc="Review teacher applications"
        />
        <AdminLink
          href="/admin/reports"
          icon={<TrendingUp className="w-5 h-5" />}
          title="Financial Reports"
          desc="Revenue and payment analytics"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 font-['Poppins']">{label}</p>
      <p className="text-3xl font-bold text-[#131313] mt-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <div>
        <p className="font-['Poppins'] font-semibold">{title}</p>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
