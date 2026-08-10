import React from 'react';
import { Container, Typography, Link, Box, Grid, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, GitHub, Email, Phone } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box className="bg-gray-900 text-white py-12 mt-auto">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" className="font-bold mb-4">
              Lost & Found Portal
            </Typography>
            <Typography variant="body2" className="text-gray-400 mb-4">
              Helping people reunite with their lost items since 2024. 
              Our mission is to create a community-driven platform where 
              nothing stays lost forever.
            </Typography>
            <div className="flex space-x-3">
              <IconButton 
                component="a" 
                href="#" 
                target="_blank"
                className="text-gray-400 hover:text-white"
              >
                <Facebook />
              </IconButton>
              <IconButton 
                component="a" 
                href="#" 
                target="_blank"
                className="text-gray-400 hover:text-white"
              >
                <Twitter />
              </IconButton>
              <IconButton 
                component="a" 
                href="#" 
                target="_blank"
                className="text-gray-400 hover:text-white"
              >
                <Instagram />
              </IconButton>
              <IconButton 
                component="a" 
                href="#" 
                target="_blank"
                className="text-gray-400 hover:text-white"
              >
                <LinkedIn />
              </IconButton>
              <IconButton 
                component="a" 
                href="#" 
                target="_blank"
                className="text-gray-400 hover:text-white"
              >
                <GitHub />
              </IconButton>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" className="font-bold mb-4">
              Quick Links
            </Typography>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
                Search Items
              </Link>
              <Link href="/report-lost" className="text-gray-400 hover:text-white transition-colors">
                Report Lost Item
              </Link>
              <Link href="/report-found" className="text-gray-400 hover:text-white transition-colors">
                Report Found Item
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" className="font-bold mb-4">
              Contact Info
            </Typography>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Email className="text-gray-400" />
                <Link href="mailto:support@lostfound.com" className="text-gray-400 hover:text-white transition-colors">
                  support@lostfound.com
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-gray-400" />
                <Link href="tel:+917539908603" className="text-gray-400 hover:text-white transition-colors">
                  +91 7539908603
                </Link>
              </div>
              <div className="mt-4">
                <Typography variant="body2" className="text-gray-400">
                  <strong className="text-white">Address:</strong>
                  <br />
                  123 Lost & Found Lane,
                  <br />
                  New York, NY 10001
                </Typography>
              </div>
            </div>
          </Grid>
        </Grid>

        <Box className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Typography variant="body2" className="text-gray-400">
              © {currentYear} Lost & Found Portal. All rights reserved.
            </Typography>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;