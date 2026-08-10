import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import LocationPicker  from '../components/LocationPicker';

const ReportLost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    color: '',
    location: {
      address: '',
      coordinates: { lat: null, lng: null }
    },
    dateLost: '',
    reward: '',
    contactEmail: user?.email || '',
    contactPhone: user?.phone || ''
  });

  const [images, setImages] = useState([]);

  const categories = [
    'Electronics', 'Pets', 'Documents', 'Jewelry', 
    'Clothing', 'Bags', 'Keys', 'Books', 'Other'
  ];

  const steps = ['Item Details', 'Location & Date', 'Contact & Images'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      location: {
        address: location.address || '',
        coordinates: location.coordinates || { lat: null, lng: null }
      }
    });
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.title.trim()) {
        setError('Please enter a title');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Please enter a description');
        return false;
      }
      if (!formData.category) {
        setError('Please select a category');
        return false;
      }
    }

    if (activeStep === 1) {
      if (!formData.location.address) {
        setError('Please enter a location');
        return false;
      }
      if (!formData.dateLost) {
        setError('Please select the date lost');
        return false;
      }
    }

    if (activeStep === 2) {
      if (!formData.contactEmail && !formData.contactPhone) {
        setError('Please provide at least one contact method');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          formDataToSend.append('location', JSON.stringify(formData.location));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(img => {
        formDataToSend.append('images', img.file);
      });

      const response = await api.post('/lost-items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setLoading(false);

      // Redirect to item details after 2 seconds
      setTimeout(() => {
        navigate(`/item/${response.data.data._id}`);
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report lost item');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Submitting your report..." />;
  }

  if (success) {
    return (
      <Container maxWidth="sm" className="py-16">
        <Paper className="p-8 text-center">
          <Typography variant="h4" className="text-green-600 font-bold mb-4">
            ✅ Report Submitted!
          </Typography>
          <Typography variant="body1" className="mb-4">
            Your lost item report has been submitted successfully.
            You will be redirected to the item details shortly.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You can track your report in the dashboard.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Paper className="p-6">
        <Typography variant="h4" className="font-bold mb-2">
          Report Lost Item
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          Provide details about your lost item to help others find it
        </Typography>

        <Stepper activeStep={activeStep} className="mb-6">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Step 1: Item Details */}
        {activeStep === 0 && (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Item Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black iPhone 14 Pro"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Provide detailed description of the item"
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Black, Silver"
                />
              </Grid>
            </Grid>
          </div>
        )}

        {/* Step 2: Location & Date */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <LocationPicker
              value={formData.location}
              onChange={handleLocationChange}
              label="Location Lost"
            />

            <TextField
              fullWidth
              label="Date Lost"
              name="dateLost"
              type="date"
              value={formData.dateLost}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="Reward Amount (Optional)"
              name="reward"
              type="number"
              value={formData.reward}
              onChange={handleChange}
              placeholder="Enter reward amount if any"
              InputProps={{
                startAdornment: <Typography className="mr-2">$</Typography>
              }}
            />
          </div>
        )}

        {/* Step 3: Contact & Images */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <Typography variant="subtitle1" className="font-bold">
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="1234567890"
                />
              </Grid>
            </Grid>

            <div className="mt-4">
              <Typography variant="subtitle1" className="font-bold mb-2">
                Upload Images
              </Typography>
              <Typography variant="caption" color="textSecondary" className="block mb-3">
                Upload clear photos of your lost item (max 5 images)
              </Typography>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxFiles={5}
              />
            </div>

            <Alert severity="info" className="mt-4">
              <Typography variant="body2">
                <strong>Tip:</strong> Provide multiple images from different angles to help identify your item.
              </Typography>
            </Alert>
          </div>
        )}

        {/* Navigation Buttons */}
        <Box className="flex justify-between mt-6">
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Submit Report' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

const handleSubmit = async () => {
  setLoading(true);
  setError('');

  try {
    console.log('📤 Submitting form...');
    console.log('Images to upload:', images.length); // ✅ Debug

    const formDataToSend = new FormData();
    
    // Append text fields
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('color', formData.color || '');
    formDataToSend.append('location', JSON.stringify(formData.location));
    formDataToSend.append('dateLost', formData.dateLost);
    formDataToSend.append('reward', formData.reward || '0');
    formDataToSend.append('contactEmail', formData.contactEmail);
    formDataToSend.append('contactPhone', formData.contactPhone || '');

    // ✅ Append images
    images.forEach((img, index) => {
      formDataToSend.append('images', img.file);
      console.log(`📎 Appended image ${index + 1}:`, img.file.name, img.file.size);
    });

    const response = await api.post('/lost-items', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Response:', response.data);
    console.log('✅ Images saved:', response.data.data.images);

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      navigate(`/item/${response.data.data._id}`);
    }, 2000);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Response:', error.response?.data);
    setError(error.response?.data?.message || 'Failed to report lost item');
    setLoading(false);
  }
};

export default ReportLost;