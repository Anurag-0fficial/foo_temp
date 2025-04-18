import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enquiries', formData);
      toast.success('Message sent successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Contact Information
            </h2>
            <div className="mt-3">
              <p className="text-lg text-gray-500">
                Have questions about our products or services? We're here to help.
              </p>
            </div>
            <div className="mt-9">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>+1 (555) 123-4567</p>
                  <p className="mt-1">Mon-Fri 8am to 6pm PST</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>support@angtech.com</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>123 Business Street</p>
                  <p className="mt-1">San Francisco, CA 94107</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 md:mt-0">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Send us a message
            </h2>
            <div className="mt-9">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="Your Name"
                      className="input-field"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="Your Email"
                      className="input-field"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      placeholder="Your Phone Number"
                      className="input-field"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      placeholder="Subject of your message"
                      className="input-field"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      name="message"
                      id="message"
                      rows={6}
                      required
                      placeholder="Your Message"
                      className="textarea-field"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn-primary">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 