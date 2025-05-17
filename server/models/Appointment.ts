import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  dateTime: Date;
  status: string;
  reason: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled', 'completed'],
      default: 'pending',
    },
    reason: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Middleware to prevent double booking
AppointmentSchema.pre('save', async function(this: mongoose.Document & IAppointment, next) {
  const Appointment = this.constructor as mongoose.Model<IAppointment>;
  const existingAppointment = await Appointment.findOne({
    doctor: this.doctor,
    dateTime: this.dateTime,
    status: { $in: ['pending', 'approved'] },
    _id: { $ne: this._id },
  });

  if (existingAppointment) {
    throw new Error('This time slot is already booked');
  }

  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);