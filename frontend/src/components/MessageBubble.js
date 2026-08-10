import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn, sender }) => {
  const { content, createdAt, isRead } = message;

  return (
    <Box
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isOwn && (
        <Avatar
          src={sender?.avatar}
          alt={sender?.name}
          className="mr-2"
          sx={{ width: 32, height: 32 }}
        />
      )}
      <Box className="max-w-[70%]">
        <Box
          className={`p-3 rounded-lg ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <Typography variant="body2" className="break-words">
            {content}
          </Typography>
        </Box>
        <Box className="flex items-center gap-2 mt-1">
          <Typography variant="caption" color="textSecondary">
            {format(new Date(createdAt), 'hh:mm a')}
          </Typography>
          {isOwn && isRead && (
            <Typography variant="caption" color="textSecondary">
              ✓✓ Read
            </Typography>
          )}
          {isOwn && !isRead && (
            <Typography variant="caption" color="textSecondary">
              ✓ Sent
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBubble;