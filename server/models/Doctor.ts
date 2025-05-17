import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  qualifications: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  patients: mongoose.Types.ObjectId[];
  appointments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    availability: {
      days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    qualifications: [{ type: String }],
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
  },
  { timestamps: true }
);

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);