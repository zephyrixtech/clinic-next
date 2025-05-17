export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  patients: string[] | Patient[];
  appointments: string[] | Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorAvailability {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface DoctorSchedule {
  doctorId: string;
  appointments: Appointment[];
  availability: DoctorAvailability;
}