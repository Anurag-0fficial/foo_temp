import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        console.log('Product data received:', response.data);
        console.log('Specifications:', response.data.specifications);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/enquiries', {
        ...enquiryForm,
        productId: id,
      });
      toast.success('Enquiry submitted successfully');
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error('Failed to submit enquiry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 text-primary-600 hover:text-primary-500"
        >
          Return to Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product Image */}
          <div className="lg:max-w-lg lg:w-full">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-center object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">${product.price}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-4 text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Highlights Section */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                <div className="mt-4">
                  <ul className="list-disc pl-4 space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-base text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Specifications Section */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {/* Basic Product Info */}
                  {product.brand && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Brand</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                    </div>
                  )}
                  {product.type && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.type}</dd>
                    </div>
                  )}
                  {product.model && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Model</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.model}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Stock Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                    </dd>
                  </div>
                  
                  {/* Technical Specifications */}
                  {product.specifications && typeof product.specifications === 'object' && 
                    Object.entries(product.specifications)
                      .filter(([_, value]) => value) // Only show non-empty values
                      .map(([key, value]) => (
                        <div key={key} className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                        </div>
                      ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="mt-16 max-w-xl">
          <h2 className="text-2xl font-bold">Interested in this product?</h2>
          <p className="text-gray-600 mt-2 mb-6">Fill out the form below and we'll get back to you with more information.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={enquiryForm.name}
                  onChange={handleInputChange}
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={enquiryForm.email}
                  onChange={handleInputChange}
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                value={enquiryForm.phone}
                onChange={handleInputChange}
                className="block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={enquiryForm.message}
                onChange={handleInputChange}
                className="block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 