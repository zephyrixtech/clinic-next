import { Request, Response } from 'express';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}
import Patient from '../models/Patient';
import MedicalRecord from '../models/MedicalRecord';

// Get all patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Get patient by ID
export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

// Create new patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create patient' });
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update patient' });
  }
};

// Get patient's medical history
export const getPatientMedicalHistory = async (req: Request, res: Response) => {
  try {
    const medicalRecords = await MedicalRecord.find({ patient: req.params.id })
      .populate('doctor', 'name specialization')
      .populate('prescriptions.medicine', 'name dosageForm strength')
      .sort({ visitDate: -1 });

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
};

// Add medical history entry
export const addMedicalHistoryEntry = async (req: AuthRequest, res: Response) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const medicalRecord = await MedicalRecord.create({
      ...req.body,
      patient: req.params.id,
      doctor: req.user?._id,
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add medical history entry' });
  }
};