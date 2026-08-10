import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Box 
} from '@mui/material';
import { 
  Search, 
  AddCircle, 
  People, 
  Security, 
  ArrowForward 
} from '@mui/icons-material';

const Home = () => {
  const features = [
    {
      icon: <Search className="text-4xl text-primary" />,
      title: 'Search & Find',
      description: 'Search through lost and found items using keywords, categories, and locations.'
    },
    {
      icon: <AddCircle className="text-4xl text-primary" />,
      title: 'Report Items',
      description: 'Easily report lost or found items with detailed descriptions and images.'
    },
    {
      icon: <People className="text-4xl text-primary" />,
      title: 'Community Driven',
      description: 'Connect with others to reunite lost items with their owners.'
    },
    {
      icon: <Security className="text-4xl text-primary" />,
      title: 'Secure & Trusted',
      description: 'Verified users and secure communication for safe transactions.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Box className="bg-primary py-20 text-white">
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" className="font-bold mb-4">
                Lost Something? Find It Here.
              </Typography>
              <Typography variant="h6" className="mb-6 opacity-90">
                Report lost items, search for found items, and reunite with what matters most.
                Join our community of helpers today.
              </Typography>
              <div className="space-x-4">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/report-lost"
                  startIcon={<AddCircle />}
                >
                  Report Lost
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  to="/search"
                  startIcon={<Search />}
                >
                  Search Items
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="bg-white p-6 rounded-lg shadow-xl">
                <Typography variant="h5" className="text-gray-800 mb-4">
                  Quick Stats
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Typography variant="h4" className="text-primary font-bold">
                      1,234
                    </Typography>
                    <Typography className="text-gray-600">Lost Items</Typography>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Typography variant="h4" className="text-green-600 font-bold">
                      856
                    </Typography>
                    <Typography className="text-gray-600">Found Items</Typography>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Typography variant="h4" className="text-purple-600 font-bold">
                      320
                    </Typography>
                    <Typography className="text-gray-600">Reunited</Typography>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Typography variant="h4" className="text-orange-600 font-bold">
                      95%
                    </Typography>
                    <Typography className="text-gray-600">Success Rate</Typography>
                  </div>
                </div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" className="py-16">
        <Typography variant="h3" className="text-center font-bold mb-12">
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <Typography variant="h6" className="font-bold mb-2">
                    {feature.title}
                  </Typography>
                  <Typography className="text-gray-600">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ❌ Recently Lost Items Section - REMOVED */}
    </div>
  );
};

export default Home;