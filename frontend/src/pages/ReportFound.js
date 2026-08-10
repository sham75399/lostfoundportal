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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import LocationPicker  from '../components/LocationPicker';

const ReportFound = () => {
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
    dateFound: '',
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
      if (!formData.dateFound) {
        setError('Please select the date found');
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
      
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          formDataToSend.append('location', JSON.stringify(formData.location));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      images.forEach(img => {
        formDataToSend.append('images', img.file);
      });

      const response = await api.post('/found-items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate(`/item/${response.data.data._id}`);
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report found item');
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
            Your found item report has been submitted successfully.
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
          Report Found Item
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          Help someone reunite with their lost item
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

        {activeStep === 0 && (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Item Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Found - Black Wallet"
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
              placeholder="Describe the item in detail"
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

        {activeStep === 1 && (
          <div className="space-y-4">
            <LocationPicker
              value={formData.location}
              onChange={handleLocationChange}
              label="Location Found"
            />

            <TextField
              fullWidth
              label="Date Found"
              name="dateFound"
              type="date"
              value={formData.dateFound}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </div>
        )}

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
                Upload clear photos of the found item (max 5 images)
              </Typography>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxFiles={5}
              />
            </div>

            <Alert severity="info" className="mt-4">
              <Typography variant="body2">
                <strong>Tip:</strong> Include photos that show distinctive features to help identify the owner.
              </Typography>
            </Alert>
          </div>
        )}

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

export default ReportFound;