'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from '@/lib/axios';
import { Medicine, MedicineFilter } from '@/types/medicine';

export default function MedicinesPage() {
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<MedicineFilter>({
    lowStock: false,
    expired: false,
  });

  useEffect(() => {
    fetchMedicines();
  }, [filter]);

  const fetchMedicines = async () => {
    try {
      let endpoint = '/medicines';
      if (filter.lowStock) {
        endpoint = '/medicines/low-stock';
      } else if (filter.expired) {
        endpoint = '/medicines/expired';
      }
      const response = await axios.get(endpoint);
      setMedicines(response.data);
    } catch (err) {
      setError('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const updateMedicineQuantity = async (medicineId: string, quantity: number) => {
    try {
      await axios.put(`/medicines/${medicineId}/quantity`, { quantity });
      await fetchMedicines();
    } catch (err) {
      setError('Failed to update medicine quantity');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={filter.lowStock}
              onChange={(e) => setFilter({ ...filter, lowStock: e.target.checked, expired: false })}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="ml-2 text-gray-700">Low Stock</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={filter.expired}
              onChange={(e) => setFilter({ ...filter, expired: e.target.checked, lowStock: false })}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="ml-2 text-gray-700">Expired</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              {session?.user?.role === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((medicine) => {
              const isLowStock = medicine.quantity <= medicine.reorderLevel;
              const isExpired = new Date(medicine.expiryDate) <= new Date();

              return (
                <tr key={medicine._id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {medicine.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {medicine.genericName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {medicine.manufacturer}
                    </div>
                    <div className="text-sm text-gray-500">
                      {medicine.dosageForm} - {medicine.strength}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {medicine.quantity} {medicine.unit}
                    </div>
                    {isLowStock && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`text-sm ${
                        isExpired ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  {session?.user?.role === 'admin' && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateMedicineQuantity(medicine._id, medicine.quantity + 1)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          +
                        </button>
                        <button
                          onClick={() => updateMedicineQuantity(medicine._id, Math.max(0, medicine.quantity - 1))}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={medicine.quantity <= 0}
                        >
                          -
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}