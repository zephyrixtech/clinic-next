export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  medicalHistory?: MedicalRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  _id: string;
  patient: string | Patient;
  doctor: string | Doctor;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  prescriptions: Prescription[];
  visitDate: Date;
  nextVisitDate?: Date;
}

export interface Prescription {
  medicine: string | Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}