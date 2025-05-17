import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import MedicalRecord from '../models/MedicalRecord';

// Get all doctors
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get doctor by ID
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('patients', 'name contactInfo')
      .populate('appointments');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

// Create new doctor
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create doctor' });
  }
};

// Update doctor
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update doctor' });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.id })
      .populate('patient', 'name contactInfo')
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get doctor's patients
export const getDoctorPatients = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('patients', 'name age gender contactInfo medicalHistory')
      .select('patients');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor.patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Add medical record for patient
export const addMedicalRecord = async (req: Request, res: Response) => {
  try {
    const medicalRecord = await MedicalRecord.create({
      ...req.body,
      doctor: req.params.id,
      visitDate: new Date(),
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add medical record' });
  }
};