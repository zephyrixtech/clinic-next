import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  dateOfBirth: Date;
  medicalHistory: {
    diagnosis: string;
    allergies: string[];
    labResults: {
      testName: string;
      date: Date;
      result: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
    },
    dateOfBirth: { type: Date, required: true },
    medicalHistory: {
      diagnosis: { type: String },
      allergies: [{ type: String }],
      labResults: [
        {
          testName: { type: String, required: true },
          date: { type: Date, required: true },
          result: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);