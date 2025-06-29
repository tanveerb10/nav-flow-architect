
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical, ExternalLink, ChevronDown, ChevronRight, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const DraggableLink = ({ 
  link, 
  columnId, 
  dropdownId,
  onUpdateLink, 
  onDeleteLink 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.label);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${columnId}-${link._id}`,
    data: {
      type: 'link',
      link,
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveUrl = () => {
    if (onUpdateLink && editedUrl !== link.url) {
      onUpdateLink(link._id, { url: editedUrl });
    }
    setIsEditing(false);
  };

  const handleSaveTitle = () => {
    if (onUpdateLink && editedTitle !== link.label) {
      onUpdateLink(link._id, { label: editedTitle });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditedUrl(link.url);
    setIsEditing(false);
  };

  const handleCancelTitleEdit = () => {
    setEditedTitle(link.label);
    setIsEditingTitle(false);
  };

  const handleDeleteLink = () => {
    if (onDeleteLink && dropdownId) {
      onDeleteLink(dropdownId, columnId, link._id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="p-3 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-5 w-5">
                  {isOpen ? (
                    <ChevronDown size={14} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input 
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-8 py-1 text-sm"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-1" 
                    onClick={handleSaveTitle}
                  >
                    <Check size={14} className="text-green-600" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-1" 
                    onClick={handleCancelTitleEdit}
                  >
                    <X size={14} className="text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {link.label}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0" 
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Edit2 size={12} className="text-gray-400" />
                  </Button>
                  <ExternalLink size={12} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={14} />
              </Button>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                #{link.position}
              </span>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t text-sm text-gray-500">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                <span className="font-medium">URL:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editedUrl}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      className="h-8 py-1 text-sm"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-1" 
                      onClick={handleSaveUrl}
                    >
                      <Check size={14} className="text-green-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-1" 
                      onClick={handleCancelEdit}
                    >
                      <X size={14} className="text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                      {link.url}
                    </a>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-1" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={14} className="text-gray-500" />
                    </Button>
                  </div>
                )}
                
                <span className="font-medium">ID:</span>
                <span className="font-mono text-xs bg-gray-100 p-1 rounded">{link._id}</span>
                
                <span className="font-medium">Position:</span>
                <span>{link.position}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the link "{link.label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DraggableLink;
