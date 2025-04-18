const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const Customer = require('../models/Customer');
const { auth, adminAuth } = require('../middleware/auth');

// Get all enquiries (admin only)
router.get('/', adminAuth,async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const enquiries = await Enquiry.find(query)
      .populate('productId', 'name type brand')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enquiries', error: error.message });
  }
});

// Get single enquiry
router.get('/:id', auth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('productId', 'name type brand')
      .populate('customerId', 'name email phone');

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enquiry', error: error.message });
  }
});

// Create enquiry
router.post('/', async (req, res) => {
  try {
    const { productId, name, email, phone, message } = req.body;

    // Find or create customer
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({
        name,
        email,
        phone
      });
      await customer.save();
    }

    // Create enquiry
    const enquiry = new Enquiry({
      productId,
      customerId: customer._id,
      name,
      email,
      phone,
      message
    });

    await enquiry.save();

    // Update customer's enquiries array
    customer.enquiries.push(enquiry._id);
    await customer.save();

    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error creating enquiry', error: error.message });
  }
});

// Update enquiry status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating enquiry status', error: error.message });
  }
});

// Add note to enquiry (admin only)
router.post('/:id/notes', adminAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    enquiry.notes.push({
      content,
      createdBy: req.user._id
    });

    await enquiry.save();
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

// Set follow-up date (admin only)
router.patch('/:id/follow-up', adminAuth, async (req, res) => {
  try {
    const { followUpDate } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { followUpDate },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error setting follow-up date', error: error.message });
  }
});

module.exports = router; 