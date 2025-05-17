import { Request, Response } from 'express';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user: IUser;
}
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import { JWT_SECRET } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create profile based on role
    let profile;
    if (role === 'patient') {
      profile = await Patient.create(profileData);
    } else if (role === 'doctor') {
      profile = await Doctor.create(profileData);
    } else if (role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      profile: profile?._id,
    });

    // Generate token
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('profile')
      .exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to get profile' });}
  }

