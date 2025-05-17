'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from '@/lib/axios';
import { Appointment, AppointmentFilter } from '@/types/appointment';
import { Doctor } from '@/types/doctor';

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<AppointmentFilter>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    Promise.all([
      fetchAppointments(),
      fetchDoctors()
    ]).finally(() => setLoading(false));
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/appointments/range', {
        params: {
          ...filter,
          doctorId: session?.user?.role === 'doctor' ? session.user.id : filter.doctorId
        }
      });
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await axios.put(`/appointments/${appointmentId}/status`, { status });
      await fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {session?.user?.role !== 'doctor' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                value={filter.doctorId || ''}
                onChange={(e) => setFilter({ ...filter, doctorId: e.target.value || undefined })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(appointment.dateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof appointment.patient === 'object' ? appointment.patient.name : 'Loading...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof appointment.doctor === 'object' ? appointment.doctor.name : 'Loading...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : appointment.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(session?.user?.role === 'admin' || session?.user?.role === 'doctor') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'approved')}
                          disabled={appointment.status !== 'pending'}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          disabled={appointment.status !== 'approved'}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          disabled={['completed', 'cancelled'].includes(appointment.status)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}