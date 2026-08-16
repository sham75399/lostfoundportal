import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Category,
  Person,
  Phone,
  Email,
  Share,
  Bookmark,
  BookmarkBorder,
  Chat,
  QrCode,
  Edit,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Close,
  ZoomIn
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { timeAgo } from '../utils/helpers';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First try lost items
      try {
        const response = await api.get(`/lost-items/${id}`);
        if (response.data.success) {
          setItem(response.data.data);
          setItemType('lost');
          setLoading(false);
          return;
        }
      } catch (lostError) {
        console.log('Not a lost item, trying found items...');
      }

      // If not found, try found items
      try {
        const response = await api.get(`/found-items/${id}`);
        if (response.data.success) {
          setItem(response.data.data);
          setItemType('found');
          setLoading(false);
          return;
        }
      } catch (foundError) {
        console.log('Not a found item either.');
      }

      setError('Item not found');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load item details');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSaved(!isSaved);
    try {
      if (!isSaved) {
        await api.post(`/saved-items/${id}`);
        setSuccessMessage('Item saved!');
      } else {
        await api.delete(`/saved-items/${id}`);
        setSuccessMessage('Item removed from saved');
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleClaim = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setClaimLoading(true);
    try {
      const claimData = itemType === 'lost' 
        ? { lostItemId: id, message: claimMessage }
        : { foundItemId: id, message: claimMessage };

      await api.post('/claims', claimData);
      setSuccessMessage('Claim request submitted successfully!');
      setClaimDialogOpen(false);
      setClaimMessage('');
      fetchItemDetails();
    } catch (error) {
      console.error('❌ Claim error:', error);
      setError(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `${itemType === 'lost' ? 'Lost' : 'Found'} item: ${item.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSuccessMessage('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !item) {
    return (
      <Container maxWidth="md" className="py-16">
        <Paper className="p-8 text-center">
          <Typography variant="h5" className="text-red-600">
            {error || 'Item not found'}
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-2">
            The item you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            className="mt-4"
            onClick={() => navigate('/search')}
          >
            Back to Search
          </Button>
        </Paper>
      </Container>
    );
  }

  const isOwner = user && item.user && item.user._id === user.id;
  const dateField = itemType === 'lost' ? item.dateLost : item.dateFound;
  const dateLabel = itemType === 'lost' ? 'Lost on' : 'Found on';
  const isAvailable = item.status === 'open' || item.status === 'available';

  return (
    <Container maxWidth="lg" className="py-8">
      <Grid container spacing={4}>
        {/* Images Section */}
        <Grid item xs={12} md={7}>
          <Paper className="p-2">
            {item.images && item.images.length > 0 ? (
              <Box className="relative">
                <Box
                  className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                  sx={{ aspectRatio: '4/3' }}
                >
                  <img
                    src={item.images[currentImageIndex]}
                    alt={`${item.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/ff0000/ffffff?text=Image+Not+Found';
                    }}
                  />

                  <Box className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded-full">
                    <ZoomIn fontSize="small" />
                  </Box>
                </Box>

                {item.images.length > 1 && (
                  <Box className="flex justify-between items-center mt-3">
                    <IconButton
                      onClick={() => setCurrentImageIndex(prev =>
                        prev === 0 ? item.images.length - 1 : prev - 1
                      )}
                      className="bg-gray-200 hover:bg-gray-300"
                      size="small"
                    >
                      <ArrowBack />
                    </IconButton>

                    <Box className="flex gap-2 overflow-x-auto px-2 flex-1 justify-center">
                      {item.images.map((img, index) => (
                        <Box
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`cursor-pointer rounded border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-transparent'
                          }`}
                          sx={{
                            width: 60,
                            height: 60,
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={`${img}?w=60&h=60&fit=crop`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </Box>
                      ))}
                    </Box>

                    <IconButton
                      onClick={() => setCurrentImageIndex(prev =>
                        prev === item.images.length - 1 ? 0 : prev + 1
                      )}
                      className="bg-gray-200 hover:bg-gray-300"
                      size="small"
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>
                )}

                {item.images.length > 1 && (
                  <Typography variant="caption" className="text-gray-500 text-center block mt-1">
                    {currentImageIndex + 1} / {item.images.length}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box className="h-64 bg-gray-200 flex items-center justify-center rounded">
                <Typography variant="body1" color="textSecondary">
                  No images available
                </Typography>
              </Box>
            )}
          </Paper>

          <Dialog
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: 'rgba(0,0,0,0.9)',
                maxHeight: '100vh',
                height: '100vh',
                maxWidth: '100vw',
                width: '100vw',
                margin: 0,
                borderRadius: 0
              }
            }}
          >
            <Box className="relative h-full flex items-center justify-center">
              <IconButton
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 z-10"
              >
                <Close />
              </IconButton>

              <img
                src={item.images[currentImageIndex]}
                alt={`${item.title} - Full view`}
                className="max-w-full max-h-full object-contain"
              />

              {item.images.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === 0 ? item.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 text-white bg-black/50 hover:bg-black/70"
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === item.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 text-white bg-black/50 hover:bg-black/70"
                  >
                    <ArrowForward />
                  </IconButton>
                </>
              )}
            </Box>
          </Dialog>

          {item.qrCode && (
            <Box className="mt-4">
              <Button
                variant="outlined"
                startIcon={<QrCode />}
                onClick={() => setQrDialogOpen(true)}
              >
                View QR Code
              </Button>
            </Box>
          )}
        </Grid>

        {/* Details Section */}
        <Grid item xs={12} md={5}>
          <Paper className="p-6">
            <Box className="flex justify-between items-start">
              <div>
                <Typography variant="h5" className="font-bold">
                  {item.title}
                </Typography>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Chip
                    label={item.category}
                    size="small"
                    icon={<Category />}
                  />
                  <Chip
                    label={itemType === 'lost' ? 'Lost' : 'Found'}
                    size="small"
                    color={itemType === 'lost' ? 'error' : 'success'}
                  />
                  <Chip
                    label={item.status}
                    size="small"
                    color={isAvailable ? 'success' : 'error'}
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <IconButton onClick={handleSave}>
                  {isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </div>
            </Box>

            <Divider className="my-4" />

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Person className="text-gray-500" />
                <div>
                  <Typography variant="body2">
                    Posted by: <strong>{item.user?.name}</strong>
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {timeAgo(item.createdAt)}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LocationOn className="text-gray-500" />
                <Typography variant="body2">
                  {item.location?.address || 'Location not specified'}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <CalendarToday className="text-gray-500" />
                <Typography variant="body2">
                  {dateLabel}: {dateField ? new Date(dateField).toLocaleDateString() : 'Date not specified'}
                </Typography>
              </div>

              {item.color && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: item.color }}
                  />
                  <Typography variant="body2">
                    Color: {item.color}
                  </Typography>
                </div>
              )}

              {item.reward && item.reward > 0 && (
                <div className="flex items-center gap-2">
                  <Typography variant="body2" className="font-bold text-green-600">
                    Reward: ${item.reward}
                  </Typography>
                </div>
              )}
            </div>

            <Divider className="my-4" />

            <Typography variant="h6" className="font-bold mb-2">
              Description
            </Typography>
            <Typography variant="body2" className="whitespace-pre-wrap">
              {item.description}
            </Typography>

            <Divider className="my-4" />

            <Typography variant="h6" className="font-bold mb-2">
              Contact
            </Typography>
            <div className="space-y-2">
              {item.contactEmail && (
                <div className="flex items-center gap-2">
                  <Email className="text-gray-500" />
                  <Typography variant="body2">
                    {item.contactEmail}
                  </Typography>
                </div>
              )}
              {item.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-500" />
                  <Typography variant="body2">
                    {item.contactPhone}
                  </Typography>
                </div>
              )}
            </div>

            {/* ✅ ACTION BUTTONS - CLAIM BUTTON HERE */}
            <div className="mt-6 space-y-2">
              {/* ✅ Claim Button - Shows for logged-in users who are NOT the owner and item is available */}
              {isAuthenticated && !isOwner && isAvailable && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={() => setClaimDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Claim This Item
                </Button>
              )}

              {/* ✅ Edit Button - Shows only for the owner */}
              {isOwner && (
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to={`/edit-item/${id}`}
                  startIcon={<Edit />}
                >
                  Edit Item
                </Button>
              )}

              {isAuthenticated && !isOwner && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Chat />}
                  component={Link}
                  to={`/chat/${item.user?._id}`}
                >
                  Message Owner
                </Button>
              )}

              {/* ✅ Login to claim message for non-logged-in users */}
              {!isAuthenticated && (
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/login"
                >
                  Login to Claim This Item
                </Button>
              )}
            </div>

            {/* ✅ Status message if item is not available */}
            {!isAvailable && (
              <Alert severity="info" className="mt-4">
                This item has already been claimed.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Claim Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" className="font-bold">
            Claim This Item
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4 text-gray-600">
            Submit a claim request for this item. Provide any additional information
            or proof of ownership that can help verify your claim.
          </Typography>
          <TextField
            fullWidth
            label="Additional Message"
            multiline
            rows={4}
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            placeholder="Describe how you can prove this is your item... (e.g., serial number, photos, purchase receipt)"
            className="mt-2"
          />
          <Typography variant="caption" color="textSecondary" className="mt-2 block">
            The owner will review your claim and respond shortly.
          </Typography>
        </DialogContent>
        <DialogActions className="p-4">
          <Button 
            onClick={() => setClaimDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClaim}
            disabled={claimLoading}
          >
            {claimLoading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
        <DialogTitle>Item QR Code</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col items-center p-4">
            <img
              src={item.qrCode}
              alt="QR Code"
              className="w-64 h-64"
            />
            <Typography variant="body2" className="mt-4 text-center">
              Scan this QR code to view the item details
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccessMessage('');
          setError('');
        }}
      >
        <Alert
          severity={successMessage ? 'success' : 'error'}
          onClose={() => {
            setSuccessMessage('');
            setError('');
          }}
        >
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ItemDetails;