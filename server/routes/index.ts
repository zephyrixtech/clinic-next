import express, { Router } from 'express';
import { auth, authorize } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Import controllers
import * as authController from '../controllers/authController';
import * as patientController from '../controllers/patientController';
import * as doctorController from '../controllers/doctorController';
import * as appointmentController from '../controllers/appointmentController';
import * as medicineController from '../controllers/medicineController';

// Error handler middleware
const asyncHandler = <P extends Request = Request, R extends Response = Response>(
  fn: (req: P, res: R, next: NextFunction) => Promise<any>
) => {
  return (req: P, res: R, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        console.error('Error in async handler:', error);
        next(error);
      });
  };
};

const router = express.Router();

// Auth routes
router.post('/auth/register', asyncHandler(authController.register));
router.post('/auth/login', asyncHandler(authController.login));
router.get('/auth/profile', auth, asyncHandler(authController.getProfile));

// Patient routes
router.get('/patients', auth, authorize('admin', 'doctor'), asyncHandler(patientController.getAllPatients));
router.get('/patients/:id', auth, asyncHandler(patientController.getPatientById));
router.post('/patients', auth, authorize('admin'), asyncHandler(patientController.createPatient));
router.put('/patients/:id', auth, authorize('admin'), asyncHandler(patientController.updatePatient));
router.get('/patients/:id/medical-history', auth, asyncHandler(patientController.getPatientMedicalHistory));
router.post('/patients/:id/medical-history', auth, authorize('doctor'), asyncHandler(patientController.addMedicalHistoryEntry));

// Doctor routes
router.get('/doctors', auth, asyncHandler(doctorController.getAllDoctors));
router.get('/doctors/:id', auth, asyncHandler(doctorController.getDoctorById));
router.post('/doctors', auth, authorize('admin'), asyncHandler(doctorController.createDoctor));
router.put('/doctors/:id', auth, authorize('admin'), asyncHandler(doctorController.updateDoctor));
router.get('/doctors/:id/appointments', auth, authorize('doctor'), asyncHandler(doctorController.getDoctorAppointments));
router.get('/doctors/:id/patients', auth, authorize('doctor'), asyncHandler(doctorController.getDoctorPatients));
router.post('/doctors/:id/medical-records', auth, authorize('doctor'), asyncHandler(doctorController.addMedicalRecord));

// Appointment routes
router.get('/appointments', auth, asyncHandler(appointmentController.getAllAppointments));
router.get('/appointments/:id', auth, asyncHandler(appointmentController.getAppointmentById));
router.post('/appointments', auth, asyncHandler(appointmentController.createAppointment));
router.put('/appointments/:id/status', auth, authorize('admin', 'doctor'), asyncHandler(appointmentController.updateAppointmentStatus));
router.get('/appointments/range', auth, asyncHandler(appointmentController.getAppointmentsByDateRange));

// Medicine routes
router.get('/medicines', auth, asyncHandler(medicineController.getAllMedicines));
router.get('/medicines/:id', auth, asyncHandler(medicineController.getMedicineById));
router.post('/medicines', auth, authorize('admin'), asyncHandler(medicineController.createMedicine));
router.put('/medicines/:id', auth, authorize('admin'), asyncHandler(medicineController.updateMedicine));
router.put('/medicines/:id/quantity', auth, authorize('admin'), asyncHandler(medicineController.updateMedicineQuantity));
router.get('/medicines/low-stock', auth, asyncHandler(medicineController.getLowStockMedicines));
router.get('/medicines/expired', auth, asyncHandler(medicineController.getExpiredMedicines));

export default router;