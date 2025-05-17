'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from '@/lib/axios';
import { Doctor } from '@/types/doctor';
import Link from 'next/link';

export default function DoctorsPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search doctors..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {session?.user?.role === 'admin' && (
          <Link
            href="/doctors/new"
            className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Doctor
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {doctor.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {doctor.specialization}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {doctor.experience} years
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Qualifications</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {doctor.qualifications.join(', ')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Available Days</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {doctor.availability.days.join(', ')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Working Hours</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {doctor.availability.startTime} - {doctor.availability.endTime}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div>📧 {doctor.contactInfo.email}</div>
                    <div>📞 {doctor.contactInfo.phone}</div>
                    <div>📍 {doctor.contactInfo.address}</div>
                  </dd>
                </div>
              </dl>
            </div>
            {session?.user?.role === 'admin' && (
              <div className="px-4 py-4 sm:px-6">
                <Link
                  href={`/doctors/${doctor._id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}