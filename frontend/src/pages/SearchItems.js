import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchFilters from '../components/SearchFilters';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';

const SearchItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    type: 'all',
    location: '',
    dateFrom: '',
    dateTo: '',
    sort: 'newest'
  });

  const itemsPerPage = 12;

  useEffect(() => {
    // Parse URL query params
    const params = new URLSearchParams(location.search);
    const initialFilters = {
      keyword: params.get('q') || '',
      category: params.get('category') || '',
      type: params.get('type') || 'all',
      location: params.get('location') || '',
      dateFrom: params.get('dateFrom') || '',
      dateTo: params.get('dateTo') || '',
      sort: params.get('sort') || 'newest'
    };
    setFilters(initialFilters);
    fetchItems(initialFilters, 1);
  }, [location.search]);

  const fetchItems = async (filterParams, page) => {
  setLoading(true);
  setError('');
  try {
    const params = {
      ...filterParams,
      page,
      limit: itemsPerPage
    };

    // ✅ Remove empty values but KEEP keyword even if empty to show all items
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === 'all') {
        delete params[key];
      }
    });

    // ✅ If keyword is empty, the backend will show all items
    console.log('🔍 Fetching items with params:', params);

    const response = await api.get('/search', { params });
    console.log('📦 Search response:', response.data);

    setItems(response.data.data || []);
    setTotalItems(response.data.pagination?.total || 0);
    setCurrentPage(page);
  } catch (error) {
    console.error('❌ Search error:', error);
    console.error('Response:', error.response?.data);
    setError('Failed to fetch items. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== '' && newFilters[key] !== 'all') {
        params.set(key, newFilters[key]);
      }
    });
    navigate(`/search?${params.toString()}`);
  };

  const handlePageChange = (event, page) => {
    fetchItems(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    const cleared = {
      keyword: '',
      category: '',
      type: 'all',
      location: '',
      dateFrom: '',
      dateTo: '',
      sort: 'newest'
    };
    setFilters(cleared);
    navigate('/search');
    fetchItems(cleared, 1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h4" className="font-bold mb-6">
        Search Items
      </Typography>

      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={() => fetchItems(filters, 1)}
        onClear={handleClearFilters}
      />

      {loading ? (
        <Box className="flex justify-center items-center py-16">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <EmptyState
          type="search"
          message="No items found matching your search"
          action={() => handleClearFilters()}
          actionLabel="Clear Filters"
        />
      ) : (
        <>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="body2" color="textSecondary">
              Found {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <ItemCard
                  item={item}
                  type={item.type || 'lost'}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box className="flex justify-center mt-8">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchItems;