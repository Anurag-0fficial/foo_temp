import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function EnquiryManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [note, setNote] = useState('');
  const [debugData, setDebugData] = useState(null);
  const [emergencyDebug, setEmergencyDebug] = useState({ directFetch: null, error: null });

  useEffect(() => {
    // Emergency direct fetch
    const emergencyFetch = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const directResponse = await fetch('http://localhost:3000/api/enquiries', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!directResponse.ok) {
          throw new Error(`HTTP error! status: ${directResponse.status}`);
        }

        const data = await directResponse.json();
        console.log('EMERGENCY DIRECT FETCH:', data);
        setEmergencyDebug(prev => ({ ...prev, directFetch: data }));
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Setting enquiries with data:', data);
          setEnquiries(data);
        } else {
          console.log('No enquiries found in response');
          // Only set mock data if no real data exists
          const mockData = [
            {
              _id: '1',
              createdAt: new Date().toISOString(),
              name: 'John Doe',
              email: 'john@example.com',
              phone: '123-456-7890',
              productId: { name: 'Laptop', type: 'Electronics', brand: 'Brand X' },
              status: 'New',
              message: 'I need information about your products'
            },
            {
              _id: '2',
              createdAt: new Date().toISOString(),
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '987-654-3210',
              productId: { name: 'Smartphone', type: 'Electronics', brand: 'Brand Y' },
              status: 'In Progress',
              message: 'When will this product be available?'
            }
          ];
          console.log('Setting mock data:', mockData);
          setEnquiries(mockData);
        }
      } catch (error) {
        console.error('EMERGENCY FETCH ERROR:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        setEmergencyDebug(prev => ({ 
          ...prev, 
          error: error.message,
          errorDetails: error.stack
        }));
      }
    };
    
    emergencyFetch();
    
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchEnquiries();
  }, [user, navigate]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/enquiries');
      console.log('Fetched enquiries data:', response.data);
      
      // Save raw response for debugging
      setDebugData(response.data);
      
      // Check if data exists and is an array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid data format:', response.data);
        alert('Invalid data format received from API');
        setEnquiries([]);
      } else {
        console.log('Setting enquiries state with:', response.data.length, 'items');
        setEnquiries(response.data);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        toast.error('Failed to load enquiries: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await api.put(`/enquiries/${enquiryId}`, { status: newStatus });
      toast.success('Enquiry status updated successfully');
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        toast.error('Failed to update enquiry status');
      }
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry || !note.trim()) return;

    try {
      await api.post(`/enquiries/${selectedEnquiry._id}/notes`, { note });
      toast.success('Note added successfully');
      setNote('');
      fetchEnquiries();
    } catch (error) {
      console.error('Error adding note:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        toast.error('Failed to add note');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* EMERGENCY DEBUG DISPLAY */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <h2 className="font-bold">EMERGENCY DEBUG</h2>
        <p>Loading state: {loading ? 'TRUE' : 'FALSE'}</p>
        <p>Enquiries length: {enquiries ? enquiries.length : 'NULL'}</p>
        <p>Direct fetch result: {emergencyDebug.directFetch ? 'DATA RECEIVED' : 'NO DATA'}</p>
        {emergencyDebug.error && <p>Error: {emergencyDebug.error}</p>}
        
        {emergencyDebug.directFetch && (
          <div>
            <p>Direct fetch data type: {Array.isArray(emergencyDebug.directFetch) ? 'ARRAY' : typeof emergencyDebug.directFetch}</p>
            {Array.isArray(emergencyDebug.directFetch) && (
              <p>Direct fetch array length: {emergencyDebug.directFetch.length}</p>
            )}
            <details>
              <summary>Show raw data</summary>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(emergencyDebug.directFetch, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Enquiry Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all enquiries including their status and details.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enquiries && enquiries.length > 0 ? (
                    enquiries.map((enquiry) => {
                      console.log('Rendering enquiry item:', enquiry);
                      return (
                        <tr key={enquiry._id || 'unknown'}>
                          {/* Date */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'Unknown date'}
                          </td>
                          {/* Customer */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="font-medium text-gray-900">{enquiry.name || 'No name'}</div>
                            <div>{enquiry.email || 'No email'}</div>
                            <div>{enquiry.phone || 'No phone'}</div>
                          </td>
                          {/* Product */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {enquiry.productId && enquiry.productId.name ? enquiry.productId.name : 'N/A'}
                          </td>
                          {/* Status */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <select
                              value={enquiry.status || 'new'}
                              onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                              className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          {/* Actions */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => setSelectedEnquiry(enquiry)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        No enquiries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Debug Information</h3>
        <p>Enquiries Array Length: {enquiries ? enquiries.length : 'null'}</p>
        <p>Is Loading: {loading ? 'Yes' : 'No'}</p>
        <div className="mt-2">
          <p className="font-medium">Raw API Response:</p>
          <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-48">
            {debugData ? JSON.stringify(debugData, null, 2) : 'No data yet'}
          </pre>
        </div>
        {enquiries && enquiries.length > 0 && (
          <div className="mt-2">
            <p className="font-medium">First Enquiry Object:</p>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(enquiries[0], null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-medium text-gray-900">Enquiry Details</h2>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedEnquiry.name}</p>
                <p className="text-sm text-gray-900">{selectedEnquiry.email}</p>
                <p className="text-sm text-gray-900">{selectedEnquiry.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedEnquiry.message}</p>
              </div>

              {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <ul className="mt-1 space-y-2">
                    {selectedEnquiry.notes.map((note, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleAddNote} className="mt-4">
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Add Note
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="note"
                      name="note"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Add Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 