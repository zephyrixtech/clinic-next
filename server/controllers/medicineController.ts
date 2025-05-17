import { Request, Response } from 'express';
import Medicine from '../models/Medicine';

// Get all medicines
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};

// Get medicine by ID
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
};

// Create new medicine
export const createMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create medicine' });
  }
};

// Update medicine
export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update medicine' });
  }
};

// Update medicine quantity
export const updateMedicineQuantity = async (req: Request, res: Response) => {
  try {
    const { quantity, operation } = req.body;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    if (operation === 'add') {
      medicine.quantity += quantity;
    } else if (operation === 'subtract') {
      if (medicine.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient quantity' });
      }
      medicine.quantity -= quantity;
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update medicine quantity' });
  }
};

// Get low stock medicines
export const getLowStockMedicines = async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const medicines = await Medicine.find({ quantity: { $lte: threshold } })
      .sort({ quantity: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock medicines' });
  }
};

// Get expired medicines
export const getExpiredMedicines = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const medicines = await Medicine.find({
      expiryDate: { $lte: currentDate }
    }).sort({ expiryDate: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expired medicines' });
  }
};