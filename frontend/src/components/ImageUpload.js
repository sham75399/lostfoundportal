import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Close
} from '@mui/icons-material';

const ImageUpload = ({ onImagesChange, maxFiles = 5, maxSize = 5 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('📎 Files dropped:', acceptedFiles.length);
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
    onImagesChange(updatedFiles);
    console.log('📸 Total files:', updatedFiles.length);
  }, [files, maxFiles, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    maxFiles
  });

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onImagesChange(updatedFiles);
  };

  const removeAll = () => {
    setFiles([]);
    onImagesChange([]);
  };

  return (
    <Box className="w-full">
      <Paper
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Box className="text-center">
          <CloudUpload className="text-4xl text-gray-400 mb-2" />
          <Typography variant="body1" className="font-medium">
            {isDragActive ? 'Drop your images here' : 'Drag & drop images here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to browse files
          </Typography>
          <Typography variant="caption" color="textSecondary" className="block mt-2">
            Max {maxFiles} files • Max {maxSize / (1024 * 1024)}MB each
          </Typography>
          <Typography variant="caption" color="textSecondary" className="block">
            Supported: JPG, PNG, GIF, WEBP
          </Typography>
        </Box>
      </Paper>

      {files.length > 0 && (
        <Box className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="subtitle2" className="font-bold">
              {files.length} file(s) selected
            </Typography>
            <Chip
              label="Remove All"
              size="small"
              onDelete={removeAll}
              deleteIcon={<Close />}
            />
          </div>
          <Grid container spacing={2}>
            {files.map((file) => (
              <Grid item xs={6} sm={4} md={3} key={file.id}>
                <Box className="relative group">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <IconButton
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    size="small"
                    onClick={() => removeFile(file.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                  {uploading && (
                    <Box className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <CircularProgress size={24} className="text-white" />
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    className="block truncate mt-1 text-gray-600"
                  >
                    {file.file.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;