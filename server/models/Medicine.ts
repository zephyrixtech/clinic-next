import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  description: string;
  quantity: number;
  manufacturer: string;
  expiryDate: Date;
  batchNumber: string;
  unitPrice: number;
  inStock: boolean;
  category: string;
  dosageForm: string;
  strength: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    manufacturer: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true },
    category: { type: String, required: true },
    dosageForm: {
      type: String,
      required: true,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'other']
    },
    strength: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware to update inStock status based on quantity
MedicineSchema.pre('save', function(next) {
  this.inStock = this.quantity > 0;
  next();
});

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);