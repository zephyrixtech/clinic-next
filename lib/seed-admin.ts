import bcrypt from "bcrypt";
import axios from "@/lib/axios";

export async function seedAdmin() {
  try {
    // Check if admin user already exists
    const adminData = {
      email: "admin@clinic.com",
      username: "admin",
      password: "admin123",
      role: "admin",
      isActive: true
    };

    try {
      const response = await axios.post('/auth/register', adminData);
      console.log("Admin user created successfully");
      return;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error === 'User already exists') {
        console.log("Admin user already exists");
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
}