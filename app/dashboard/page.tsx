'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from '@/lib/axios';
import { Appointment } from '@/types/appointment';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const response = await axios.get('/appointments/range', {
          params: {
            startDate: today.toISOString(),
            endDate: tomorrow.toISOString(),
            doctorId: session?.user?.role === 'doctor' ? session.user.id : undefined
          }
        });

        setTodayAppointments(response.data);
      } catch (err) {
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchTodayAppointments();
    }
  }, [session]);

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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Today's Appointments
        </h2>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(appointment.dateTime).toLocaleTimeString()}
                    </p>
                    <p className="text-gray-600">
                      Patient: {typeof appointment.patient === 'object' ? appointment.patient.name : 'Loading...'}
                    </p>
                    <p className="text-gray-600">
                      Doctor: {typeof appointment.doctor === 'object' ? appointment.doctor.name : 'Loading...'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
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
                </div>
                {appointment.reason && (
                  <p className="mt-2 text-gray-600">
                    Reason: {appointment.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}