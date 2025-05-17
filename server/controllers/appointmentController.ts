import { Request, Response } from 'express';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';

// Get all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name contactInfo')
      .populate('doctor', 'name specialization')
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name contactInfo')
      .populate('doctor', 'name specialization');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

// Create new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    // Check doctor availability
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const appointmentDate = new Date(req.body.dateTime);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!doctor.availability.days.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'Doctor is not available on this day' });
    }

    const appointmentTime = appointmentDate.toTimeString().split(' ')[0];
    if (appointmentTime < doctor.availability.startTime || 
        appointmentTime > doctor.availability.endTime) {
      return res.status(400).json({ error: 'Appointment time is outside doctor\'s working hours' });
    }

    const appointment = await Appointment.create(req.body);
    
    // Update doctor's appointments list
    await Doctor.findByIdAndUpdate(
      req.body.doctor,
      { $push: { appointments: appointment._id } }
    );

    res.status(201).json(appointment);
  } catch (error: any) {
    if (error.message === 'This time slot is already booked') {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to create appointment' });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update appointment status' });
  }
};

// Get appointments by date range
export const getAppointmentsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, doctorId } = req.query;
    
    const query: any = {
      dateTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };

    if (doctorId) {
      query.doctor = doctorId;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name contactInfo')
      .populate('doctor', 'name specialization')
      .sort({ dateTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};