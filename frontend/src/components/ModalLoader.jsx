import React from 'react';
import { Backdrop, CircularProgress, Box } from '@mui/material';

const ModalLoader = ({ open, size = 60, thickness = 4, color = '#1976d2' }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <CircularProgress 
          size={size}
          thickness={thickness}
          sx={{
            color: color,
          }}
        />
      </Box>
    </Backdrop>
  );
};

export default ModalLoader;