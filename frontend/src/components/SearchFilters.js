import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Chip,
  Box,
  IconButton,
  Collapse,
  Slider,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const SearchFilters = ({ filters, onFilterChange, onSearch, onClear }) => {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {
    keyword: '',
    category: '',
    type: 'all',
    location: '',
    dateFrom: '',
    dateTo: '',
    sort: 'newest',
    priceRange: [0, 1000]
  });

  const categories = [
    'All', 'Electronics', 'Pets', 'Documents', 'Jewelry', 
    'Clothing', 'Bags', 'Keys', 'Books', 'Other'
  ];

  const types = [
    { value: 'all', label: 'All Items' },
    { value: 'lost', label: 'Lost Items' },
    { value: 'found', label: 'Found Items' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'relevance', label: 'Most Relevant' }
  ];

  const handleChange = (field, value) => {
    setLocalFilters({
      ...localFilters,
      [field]: value
    });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onSearch(localFilters);
  };

  const handleClear = () => {
    const cleared = {
      keyword: '',
      category: '',
      type: 'all',
      location: '',
      dateFrom: '',
      dateTo: '',
      sort: 'newest',
      priceRange: [0, 1000]
    };
    setLocalFilters(cleared);
    onClear();
  };

  // Count active filters (excluding empty values)
const activeFilters = Object.keys(localFilters).filter(key => {
  const value = localFilters[key];
  return value && value !== '' && value !== 'all' && value !== '0' && value !== 0;
}).length;

  return (
    <Paper className="p-4 mb-4" elevation={2}>
      {/* Main Search Bar */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by keyword, title, or description..."
            value={localFilters.keyword}
            onChange={(e) => handleChange('keyword', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            InputProps={{
              startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
              endAdornment: localFilters.keyword && (
                <IconButton size="small" onClick={() => handleChange('keyword', '')}>
                  <Clear fontSize="small" />
                </IconButton>
              )
            }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={localFilters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label="Type"
            >
              {types.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              label="Category"
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <div className="flex gap-2">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleApply}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              color={expanded ? 'primary' : 'default'}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
        </Grid>
      </Grid>

      {/* Advanced Filters */}
      <Collapse in={expanded} className="mt-4">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Location"
              placeholder="City, state, or address"
              value={localFilters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={localFilters.sort}
                onChange={(e) => handleChange('sort', e.target.value)}
                label="Sort By"
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Price Range (Reward)</Typography>
            <Slider
              value={localFilters.priceRange || [0, 1000]}
              onChange={(e, newValue) => handleChange('priceRange', newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
            />
          </Grid>

          <Grid item xs={12} className="flex justify-end gap-2">
            <Button onClick={handleClear} color="secondary">
              Clear All
            </Button>
            <Button variant="contained" onClick={handleApply}>
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Collapse>

      {/* Active Filters Chips */}
      {activeFilters > 0 && (
        <Box className="flex flex-wrap gap-2 mt-3">
          {localFilters.keyword && (
            <Chip
              label={`Keyword: ${localFilters.keyword}`}
              onDelete={() => handleChange('keyword', '')}
              size="small"
            />
          )}
          {localFilters.category && (
            <Chip
              label={`Category: ${localFilters.category}`}
              onDelete={() => handleChange('category', '')}
              size="small"
            />
          )}
          {localFilters.type && localFilters.type !== 'all' && (
            <Chip
              label={`Type: ${localFilters.type}`}
              onDelete={() => handleChange('type', 'all')}
              size="small"
            />
          )}
          {localFilters.location && (
            <Chip
              label={`Location: ${localFilters.location}`}
              onDelete={() => handleChange('location', '')}
              size="small"
            />
          )}
          {localFilters.dateFrom && (
            <Chip
              label={`From: ${localFilters.dateFrom}`}
              onDelete={() => handleChange('dateFrom', '')}
              size="small"
            />
          )}
          {localFilters.dateTo && (
            <Chip
              label={`To: ${localFilters.dateTo}`}
              onDelete={() => handleChange('dateTo', '')}
              size="small"
            />
          )}
          <Chip
            label={`${activeFilters} filters active`}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
};

export default SearchFilters;