
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Link, Image as ImageIcon, Trash2 } from 'lucide-react';
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

    // Create a local URL for the uploaded image
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
      // Direct update when not in editing mode
      onUpdateColumn(dropdownId, column._id, {
        image: {
          ...column.image,
          linkUrl: newUrl,
        }
      });
    } else {
      // Update temp data when in editing mode
      setTempData(prev => ({ ...prev, linkUrl: newUrl }));
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-purple-600" />
            {isEditing ? (
              <Input
                value={tempData.title}
                onChange={(e) => setTempData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Column title"
                className="h-8 text-sm font-medium"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {column.title || 'Image Column'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Edit</span>
                ✏️
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Link URL - Required and always editable */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">
              Link URL <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Link size={16} className="text-gray-400" />
              <Input
                value={isEditing ? tempData.linkUrl : (column.image?.linkUrl || '')}
                onChange={(e) => handleLinkUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="h-8 text-sm"
                required
              />
            </div>
          </div>

          {/* Image Upload - Optional */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Image (optional)</Label>
            {column.image?.url ? (
              <div className="relative">
                <img 
                  src={column.image.url} 
                  alt={column.image.altText || 'Uploaded image'} 
                  className="w-full h-32 object-cover rounded border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                  onClick={() => document.getElementById(`file-${column._id}`).click()}
                >
                  <Upload size={12} />
                  Change
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => document.getElementById(`file-${column._id}`).click()}
              >
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload image (optional)</p>
              </div>
            )}
            <input
              id={`file-${column._id}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Alt Text */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Alt Text (optional)</Label>
            {isEditing ? (
              <Input
                value={tempData.altText}
                onChange={(e) => setTempData(prev => ({ ...prev, altText: e.target.value }))}
                placeholder="Describe the image"
                className="h-8 text-sm"
              />
            ) : (
              <div className="min-h-[32px] px-3 py-2 border rounded-md bg-white text-sm text-gray-700">
                {column.image?.altText || 'No alt text'}
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageColumn;
