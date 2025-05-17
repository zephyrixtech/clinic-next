'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import { Patient } from '@/types/patient';
import { MedicalRecord } from '@/types/patient';

export default function PatientRecordsPage() {
  const { patientId } = useParams();
  const { data: session } = useSession();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    symptoms: '',
    notes: '',
    prescriptions: [{ medicine: '', dosage: '', frequency: '', duration: '', notes: '' }]
  });

  useEffect(() => {
    Promise.all([
      fetchPatient(),
      fetchMedicalHistory()
    ]).finally(() => setLoading(false));
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await axios.get(`/patients/${patientId}`);
      setPatient(response.data);
    } catch (err) {
      setError('Failed to fetch patient details');
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const response = await axios.get(`/patients/${patientId}/medical-history`);
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch medical history');
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/patients/${patientId}/medical-history`, {
        ...newRecord,
        symptoms: newRecord.symptoms.split(',').map(s => s.trim()),
      });
      await fetchMedicalHistory();
      setNewRecord({
        diagnosis: '',
        symptoms: '',
        notes: '',
        prescriptions: [{ medicine: '', dosage: '', frequency: '', duration: '', notes: '' }]
      });
    } catch (err) {
      setError('Failed to add medical record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Patient Information
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.age}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.contactInfo.phone}</dd>
            </div>
          </dl>
        </div>
      </div>

      {session?.user?.role === 'doctor' && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Add Medical Record
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                  Diagnosis
                </label>
                <input
                  type="text"
                  id="diagnosis"
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                  Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  id="symptoms"
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Medical History
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {records.length === 0 ? (
            <p className="p-4 text-gray-500">No medical records found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {records.map((record) => (
                <li key={record._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm text-gray-900">
                        <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Symptoms:</span>{' '}
                        {record.symptoms.join(', ')}
                      </p>
                      {record.notes && (
                        <p className="mt-1 text-sm text-gray-500">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Dr.{' '}
                      {typeof record.doctor === 'object' ? record.doctor.name : 'Unknown'}
                    </p>
                  </div>
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Prescriptions</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {record.prescriptions.map((prescription, index) => (
                          <li key={index} className="py-2">
                            <p className="text-sm text-gray-900">
                              {typeof prescription.medicine === 'object'
                                ? prescription.medicine.name
                                : 'Unknown Medicine'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {prescription.dosage} - {prescription.frequency} for {prescription.duration}
                            </p>
                            {prescription.notes && (
                              <p className="text-sm text-gray-500">
                                Note: {prescription.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}