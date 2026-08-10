import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';

const EditFoundItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    contactEmail: '',
    contactPhone: ''
  });
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const categories = [
    'Electronics', 'Pets', 'Documents', 'Jewelry',
    'Clothing', 'Bags', 'Keys', 'Books', 'Other'
  ];

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      console.log('📝 Fetching found item details...');
      const response = await api.get(`/found-items/${id}`);
      const item = response.data.data;
      
      // Check if user is the owner
      if (item.user._id !== user?.id) {
        setError('You are not authorized to edit this item');
        setLoading(false);
        return;
      }

      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        color: item.color || '',
        location: item.location || { address: '', coordinates: { lat: null, lng: null } },
        dateFound: item.dateFound ? new Date(item.dateFound).toISOString().split('T')[0] : '',
        contactEmail: item.contactEmail || '',
        contactPhone: item.contactPhone || ''
      });
      setExistingImages(item.images || []);
    } catch (error) {
      console.error('❌ Error fetching found item:', error);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

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

  const handleNewImagesChange = (images) => {
    setNewImages(images);
  };

  const handleRemoveExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
    console.log('📤 Updating found item...');
    console.log('Item ID:', id);
    console.log('User ID:', user?.id);
    
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'location') {
        formDataToSend.append('location', JSON.stringify(formData.location));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Send existing images
    formDataToSend.append('existingImages', JSON.stringify(existingImages));

    // Append new images
    newImages.forEach(img => {
      formDataToSend.append('images', img.file);
    });

    // ✅ Use the found-items endpoint
    const response = await api.put(`/found-items/${id}`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Found item updated:', response.data);
    setSuccess(true);
    setSubmitting(false);

    setTimeout(() => {
      navigate(`/item/${id}`);
    }, 2000);

  } catch (error) {
    console.error('❌ Update error:', error);
    console.error('Response:', error.response?.data);
    setError(error.response?.data?.message || 'Failed to update item');
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <Container maxWidth="md" className="py-16">
        <Box className="flex justify-center items-center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" className="py-16">
        <Paper className="p-8 text-center">
          <Typography variant="h4" className="text-green-600 font-bold mb-4">
            ✅ Item Updated!
          </Typography>
          <Typography variant="body1" className="mb-4">
            Your found item has been updated successfully.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/item/${id}`)}
          >
            View Item
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Paper className="p-6">
        <Typography variant="h4" className="font-bold mb-2">
          Edit Found Item
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-6">
          Update the details of the item you found
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

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
              />
            </Grid>

            <Grid item xs={12}>
              <LocationPicker
                value={formData.location}
                onChange={handleLocationChange}
                label="Location Found"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </Grid>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="font-bold mb-2">
                  Current Images
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <Box key={index} className="relative">
                      <img
                        src={img}
                        alt={`Item ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100/ff0000/ffffff?text=Error';
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        className="absolute -top-2 -right-2 min-w-0 p-0 w-5 h-5 bg-white rounded-full border"
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}

            {/* New Images Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="font-bold mb-2">
                Add New Images (Optional)
              </Typography>
              <ImageUpload
                onImagesChange={handleNewImagesChange}
                maxFiles={5}
              />
            </Grid>

            <Grid item xs={12} className="flex gap-3">
              <Button
                variant="outlined"
                onClick={() => navigate(`/item/${id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Item'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditFoundItem;