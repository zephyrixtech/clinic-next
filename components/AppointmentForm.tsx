'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Doctor } from '@/types/doctor';
import { Patient } from '@/types/patient';
import { AppointmentFormData } from '@/types/appointment';

interface AppointmentFormProps {
  initialData?: AppointmentFormData;
}

export default function AppointmentForm({ initialData }: AppointmentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDoctors(),
      session?.user?.role === 'admin' ? fetchPatients() : Promise.resolve(),
    ]);
  }, [session]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients');
      setPatients(response.data);
    } catch (err) {
      setError('Failed to fetch patients');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const appointmentData = {
      doctorId: formData.get('doctorId') as string,
      patientId: session?.user?.role === 'patient' ? session.user.id : formData.get('patientId') as string,
      dateTime: formData.get('dateTime') as string,
      reason: formData.get('reason') as string,
      notes: formData.get('notes') as string,
    };

    try {
      await axios.post('/appointments', appointmentData);
      router.push('/appointments');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d._id === doctorId);
    setSelectedDoctor(doctor || null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Appointment Details
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Schedule a new appointment with a doctor.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="doctorId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  required
                  defaultValue={initialData?.doctorId || ''}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {session?.user?.role === 'admin' && (
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="patientId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Patient
                  </label>
                  <select
                    id="patientId"
                    name="patientId"
                    required
                    defaultValue={initialData?.patientId || ''}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="dateTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  id="dateTime"
                  required
                  defaultValue={initialData?.dateTime}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason for Visit
                </label>
                <input
                  type="text"
                  name="reason"
                  id="reason"
                  required
                  defaultValue={initialData?.reason}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  defaultValue={initialData?.notes}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {selectedDoctor && (
                <div className="col-span-6 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Doctor Availability
                  </h4>
                  <p className="text-sm text-gray-600">
                    Available days: {selectedDoctor.availability.days.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Hours: {selectedDoctor.availability.startTime} - {selectedDoctor.availability.endTime}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
}