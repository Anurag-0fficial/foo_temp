import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [note, setNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      await api.post(`/customers/${selectedCustomer._id}/notes`, { content: note });
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer._id === selectedCustomer._id
            ? {
                ...customer,
                notes: [...customer.notes, { content: note, createdAt: new Date() }]
              }
            : customer
        )
      );
      setNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      await api.put(`/customers/${selectedCustomer._id}/tags`, {
        tags: [...selectedCustomer.tags, newTag]
      });
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer._id === selectedCustomer._id
            ? {
                ...customer,
                tags: [...customer.tags, newTag]
              }
            : customer
        )
      );
      setNewTag('');
      toast.success('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    try {
      await api.put(`/customers/${selectedCustomer._id}/tags`, {
        tags: selectedCustomer.tags.filter(tag => tag !== tagToRemove)
      });
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer._id === selectedCustomer._id
            ? {
                ...customer,
                tags: customer.tags.filter(tag => tag !== tagToRemove)
              }
            : customer
        )
      );
      toast.success('Tag removed successfully');
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const handleUpdateLastContact = async (date) => {
    try {
      await api.put(`/customers/${selectedCustomer._id}/last-contact`, { date });
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer._id === selectedCustomer._id
            ? {
                ...customer,
                lastContact: date
              }
            : customer
        )
      );
      toast.success('Last contact date updated');
    } catch (error) {
      console.error('Error updating last contact:', error);
      toast.error('Failed to update last contact date');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === '' || customer.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(customers.flatMap(customer => customer.tags))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customers including their contact information, tags, and notes.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tags
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Contact
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>{customer.email}</div>
                        <div>{customer.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.lastContact
                          ? format(new Date(customer.lastContact), 'MMM d, yyyy')
                          : 'Never'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Customer Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedCustomer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-primary-600 hover:text-primary-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <form onSubmit={handleAddTag} className="mt-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="input-field input-field-sm"
                              placeholder="Add a tag..."
                            />
                            <button
                              type="submit"
                              className="btn-primary px-3 py-2 text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Last Contact</h4>
                        <div className="mt-2">
                          <input
                            type="date"
                            value={selectedCustomer.lastContact ? format(new Date(selectedCustomer.lastContact), 'yyyy-MM-dd') : ''}
                            onChange={(e) => handleUpdateLastContact(e.target.value)}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                        <div className="mt-2 space-y-2">
                          {selectedCustomer.notes?.map((note, index) => (
                            <div key={index} className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {note.content}
                            </div>
                          ))}
                        </div>
                        <form onSubmit={handleAddNote} className="mt-4">
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Add a note..."
                          />
                          <button
                            type="submit"
                            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Add Note
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 