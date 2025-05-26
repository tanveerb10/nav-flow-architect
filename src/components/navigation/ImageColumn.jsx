
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Alert
} from '@mui/material';
import {
  Upload,
  Link,
  Image as ImageIcon,
  Delete,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';

const ImageColumn = ({ column, dropdownId, onUpdateColumn, onRemoveColumn }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({
    title: column.title || '',
    altText: column.image?.altText || '',
    linkUrl: column.image?.linkUrl || '',
  });
  const { toast } = useToast();

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    
    onUpdateColumn(dropdownId, column._id, {
      image: {
        ...column.image,
        url: imageUrl,
      }
    });

    toast({
      title: "Image uploaded",
      description: "Image has been uploaded successfully.",
    });
  };

  const handleSave = () => {
    if (!tempData.linkUrl.trim()) {
      toast({
        title: "Link URL required",
        description: "Please enter a link URL for this image column.",
        variant: "destructive",
      });
      return;
    }

    if (!tempData.altText.trim()) {
      toast({
        title: "Alt text required",
        description: "Please enter alt text for this image column.",
        variant: "destructive",
      });
      return;
    }

    onUpdateColumn(dropdownId, column._id, {
      title: tempData.title,
      image: {
        ...column.image,
        altText: tempData.altText,
        linkUrl: tempData.linkUrl,
      }
    });
    setIsEditing(false);
    
    toast({
      title: "Image column updated",
      description: "Image details have been saved.",
    });
  };

  const handleCancel = () => {
    setTempData({
      title: column.title || '',
      altText: column.image?.altText || '',
      linkUrl: column.image?.linkUrl || '',
    });
    setIsEditing(false);
  };

  const handleRemove = () => {
    onRemoveColumn(dropdownId, column._id);
  };

  const handleLinkUrlChange = (newUrl) => {
    if (!isEditing) {
      onUpdateColumn(dropdownId, column._id, {
        image: {
          ...column.image,
          linkUrl: newUrl,
        }
      });
    } else {
      setTempData(prev => ({ ...prev, linkUrl: newUrl }));
    }
  };

  const handleAltTextChange = (newAltText) => {
    if (!isEditing) {
      onUpdateColumn(dropdownId, column._id, {
        image: {
          ...column.image,
          altText: newAltText,
        }
      });
    } else {
      setTempData(prev => ({ ...prev, altText: newAltText }));
    }
  };

  return (
    <Card sx={{ bgcolor: '#f3e8ff', border: '1px solid #c4b5fd' }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ImageIcon sx={{ color: '#7c3aed', fontSize: 16 }} />
            {isEditing ? (
              <TextField
                value={tempData.title}
                onChange={(e) => setTempData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Column title"
                size="small"
                sx={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            ) : (
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {column.title || 'Image Column'}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            {!isEditing && (
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
              >
                <Edit sx={{ fontSize: 14 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{ color: '#dc2626', '&:hover': { bgcolor: '#fef2f2' } }}
            >
              <Delete sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              Link URL <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Link sx={{ fontSize: 16, color: '#9ca3af' }} />
              <TextField
                value={isEditing ? tempData.linkUrl : (column.image?.linkUrl || '')}
                onChange={(e) => handleLinkUrlChange(e.target.value)}
                placeholder="https://example.com"
                size="small"
                fullWidth
                required
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              Alt Text <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField
              value={isEditing ? tempData.altText : (column.image?.altText || '')}
              onChange={(e) => handleAltTextChange(e.target.value)}
              placeholder="Describe the image"
              size="small"
              fullWidth
              required
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              Image (optional)
            </Typography>
            {column.image?.url ? (
              <Box position="relative">
                <img 
                  src={column.image.url} 
                  alt={column.image.altText || 'Uploaded image'} 
                  style={{ width: '100%', height: 128, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload />}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)'
                  }}
                  onClick={() => document.getElementById(`file-${column._id}`).click()}
                >
                  Change
                </Button>
              </Box>
            ) : (
              <Box 
                sx={{
                  border: '2px dashed #d1d5db',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#a855f7' },
                  transition: 'border-color 0.2s'
                }}
                onClick={() => document.getElementById(`file-${column._id}`).click()}
              >
                <Upload sx={{ fontSize: 24, color: '#9ca3af', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload image (optional)
                </Typography>
              </Box>
            )}
            <input
              id={`file-${column._id}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </Box>

          {isEditing && (
            <Box display="flex" gap={1} pt={1}>
              <Button onClick={handleSave} variant="contained" size="small" fullWidth>
                Save
              </Button>
              <Button onClick={handleCancel} variant="outlined" size="small" fullWidth>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImageColumn;
