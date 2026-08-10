import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Category,
  Visibility,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';

const ItemCard = ({ item, type, onFavorite, isFavorited }) => {
  const {
    _id,
    title,
    description,
    images,
    category,
    location,
    createdAt,
    status,
    views
  } = item;

  const itemDate = type === 'lost' ? item.dateLost : item.dateFound;
  const statusColor = status === 'open' || status === 'available' ? 'success' : 'error';

  return (
    <Card className="h-full hover:shadow-xl transition-shadow duration-300 relative">
      {images && images.length > 0 ? (
        <CardMedia
          component="img"
          height="200"
          image={images[0]}
          alt={title}
          className="h-48 object-cover"
        />
      ) : (
        <Box className="h-48 bg-gray-200 flex items-center justify-center">
          <Typography variant="body2" color="textSecondary">
            No Image Available
          </Typography>
        </Box>
      )}

      <Box className="absolute top-2 right-2 flex flex-col gap-2">
        <Chip
          label={type === 'lost' ? 'Lost' : 'Found'}
          size="small"
          color={type === 'lost' ? 'error' : 'success'}
          className="font-bold"
        />
        <Chip
          label={status}
          size="small"
          color={statusColor}
          className="font-bold"
        />
      </Box>

      <CardContent>
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-bold line-clamp-1">
            {title}
          </Typography>
          <Tooltip title="Views">
            <Box className="flex items-center text-gray-500">
              <Visibility fontSize="small" className="mr-1" />
              <Typography variant="caption">{views || 0}</Typography>
            </Box>
          </Tooltip>
        </div>

        <Typography
          variant="body2"
          color="textSecondary"
          className="line-clamp-2 mb-3"
        >
          {description}
        </Typography>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Category fontSize="small" className="mr-1" />
            <span>{category}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <LocationOn fontSize="small" className="mr-1" />
            <span className="line-clamp-1">{location?.address || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarToday fontSize="small" className="mr-1" />
            <span>{new Date(itemDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            component={Link}
            to={`/item/${_id}`}
            variant="contained"
            color="primary"
            size="small"
          >
            View Details
          </Button>
          {onFavorite && (
            <IconButton onClick={() => onFavorite(_id)} size="small">
              {isFavorited ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;