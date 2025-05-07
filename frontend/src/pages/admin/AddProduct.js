import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Store File objects for images, not URLs
  const [imageFiles, setImageFiles] = useState([]); 
  // Store preview URLs generated locally
  const [imagePreviews, setImagePreviews] = useState([]); 

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    description: '',
    specifications: {
      powerRating: '',
      voltage: '',
      batteryCapacity: '',
      dimensions: '',
      weight: ''
    },
    price: '',
    // Renamed from stockQuantity to match backend model 'stock'
    stock: '', 
    features: [''],
    // 'images' field is removed from here as it's handled by imageFiles state
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeatureField = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Handle file selection, store files and create previews
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files].slice(0, 5); // Limit to 5 images total
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove selected image file and its preview
  const removeImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Clean up blob URL
    URL.revokeObjectURL(imagePreviews[index]); 
    
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  // Clean up preview URLs on component unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all regular form fields
      Object.keys(formData).forEach(key => {
        if (key === 'specifications') {
          // Send specifications as a JSON string
          formDataToSend.append(key, JSON.stringify(formData[key])); 
        } else if (key === 'features') {
          // Send features as a JSON string
          formDataToSend.append(key, JSON.stringify(formData.features.filter(f => f.trim() !== ''))); // Filter empty features
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image files directly
      imageFiles.forEach(file => {
        formDataToSend.append('images', file); // Use 'images' key for multer backend
      });

      // Single API call to create product with images
      await api.post('/api/products', formDataToSend, {
        // Remove explicit headers - browser will set Content-Type correctly for FormData
        // headers: {
        //   'Content-Type': 'multipart/form-data', 
        // },
      });

      toast.success('Product added successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Basic Information */}
            <div className="col-span-2">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="form-label">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="type" className="form-label">
                    Product Type
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    className="select-field"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="UPS">UPS</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Stabilizer">Stabilizer</option>
                    <option value="Battery">Battery</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brand" className="form-label">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    className="input-field"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="model" className="form-label">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    id="model"
                    required
                    className="input-field"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="col-span-2">
              <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="specifications.powerRating" className="form-label">
                    Power Rating
                  </label>
                  <input
                    type="text"
                    name="specifications.powerRating"
                    id="specifications.powerRating"
                    className="input-field"
                    value={formData.specifications.powerRating}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="specifications.voltage" className="form-label">
                    Voltage
                  </label>
                  <input
                    type="text"
                    name="specifications.voltage"
                    id="specifications.voltage"
                    className="input-field"
                    value={formData.specifications.voltage}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="specifications.batteryCapacity" className="form-label">
                    Battery Capacity
                  </label>
                  <input
                    type="text"
                    name="specifications.batteryCapacity"
                    id="specifications.batteryCapacity"
                    className="input-field"
                    value={formData.specifications.batteryCapacity}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="specifications.dimensions" className="form-label">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    name="specifications.dimensions"
                    id="specifications.dimensions"
                    className="input-field"
                    value={formData.specifications.dimensions}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="specifications.weight" className="form-label">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="specifications.weight"
                    id="specifications.weight"
                    className="input-field"
                    value={formData.specifications.weight}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div>
              <label htmlFor="price" className="form-label">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock" className="form-label">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                required
                min="0"
                className="input-field"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                className="textarea-field"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Features */}
            <div className="col-span-2">
              <label className="form-label">Features</label>
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="input-field"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="btn-secondary"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="btn-primary"
                >
                  Add Feature
                </button>
              </div>
            </div>

            {/* Image Upload Section - Updated */}
            <div className="col-span-2">
              <label className="form-label">Product Images (Max 5)</label>
              <div className="mt-2">
                <div className="flex items-center">
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={imageFiles.length >= 5}
                  />
                   <label 
                     htmlFor="product-images"
                     className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${imageFiles.length >= 5 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                   >
                    Choose Files ({imageFiles.length}/5)
                   </label>
                 </div>
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Product Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                        onLoad={() => console.log(`Preview ${index+1} loaded`)}
                        onError={() => console.error(`Preview ${index+1} failed to load`)}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label="Remove image"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 