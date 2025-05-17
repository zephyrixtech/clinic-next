export interface Appointment {
  _id: string;
  patient: string | Patient;
  doctor: string | Doctor;
  dateTime: Date;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentFormData {
  doctorId: string;
  patientId: string;
  dateTime: string;
  reason: string;
  notes?: string;
}

export interface AppointmentFilter {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  status?: string;
}