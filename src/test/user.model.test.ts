import { describe, it, expect } from 'vitest';
import type { User, TeacherUser, UserRole } from '../app/core/models/user.model';

describe('User Model Types', () => {
  it('should allow creating a valid User object', () => {
    const user: User = {
      id: 1,
      first_name: 'Ahmed',
      last_name: 'Ali',
      email: 'ahmed@example.com',
      role: 'parent',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };
    expect(user.id).toBe(1);
    expect(user.first_name).toBe('Ahmed');
    expect(user.role).toBe('parent');
  });

  it('should allow creating a TeacherUser with teacher_profile', () => {
    const teacher: TeacherUser = {
      id: 2,
      first_name: 'Sara',
      last_name: 'Hassan',
      email: 'sara@example.com',
      role: 'teacher',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      teacher_profile: {
        id: 10,
        bio: 'Math teacher',
        hourly_rate: 150,
        currency: 'EGP',
        experience_years: 5,
        avg_rating: 4.8,
        total_reviews: 42,
        total_bookings: 120,
        verification_status: 'verified',
        is_featured: true,
        accepts_online: true,
        accepts_in_person: true,
        is_available: true,
      },
    };
    expect(teacher.teacher_profile.avg_rating).toBe(4.8);
    expect(teacher.teacher_profile.total_bookings).toBe(120);
    expect(teacher.teacher_profile.verification_status).toBe('verified');
  });

  it('should support all valid UserRole types', () => {
    const roles: UserRole[] = ['admin', 'parent', 'teacher'];
    expect(roles).toHaveLength(3);
    expect(roles).toContain('admin');
    expect(roles).toContain('parent');
    expect(roles).toContain('teacher');
  });
});
