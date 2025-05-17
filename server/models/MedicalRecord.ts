import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  visitDate: Date;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  prescriptions: {
    medicine: mongoose.Types.ObjectId;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitDate: { type: Date, required: true },
    diagnosis: { type: String, required: true },
    symptoms: [{ type: String }],
    notes: { type: String },
    prescriptions: [
      {
        medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);