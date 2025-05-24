
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableLink from './DraggableLink';
import { Check, Edit2, GripVertical, Plus, Trash2, X, Image, Link as LinkIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DropdownColumn = ({ 
  column, 
  dropdownId,
  onUpdateLink,
  onDeleteLink,
  onAddLink,
  onUpdateColumn,
  onRemoveColumn
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title || '');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${dropdownId}-${column._id}`,
    data: {
      type: 'column',
      column,
      dropdownId,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const linkIds = column.links?.map(link => `${column._id}-${link._id}`) || [];
  
  const handleSaveTitle = () => {
    if (onUpdateColumn && editedTitle !== column.title) {
      onUpdateColumn(dropdownId, column._id, { title: editedTitle });
    }
    setIsEditingTitle(false);
  };
  
  const handleCancelTitleEdit = () => {
    setEditedTitle(column.title || '');
    setIsEditingTitle(false);
  };

  const handleRemoveColumn = () => {
    if (onRemoveColumn) {
      onRemoveColumn(dropdownId, column._id);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const isImageColumn = column.type === 'image';
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="bg-white h-full">
        <CardHeader className="pb-2 pt-3 px-3 flex flex-row items-center space-y-0 gap-3">
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={16} />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="h-7 text-sm py-1"
                  placeholder="Column title"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0" 
                  onClick={handleSaveTitle}
                >
                  <Check size={14} className="text-green-600" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0" 
                  onClick={handleCancelTitleEdit}
                >
                  <X size={14} className="text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">
                  {column.title || (isImageColumn ? 'Image Column' : 'Links Column')}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 size={12} className="text-gray-400" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isImageColumn ? (
              <Image size={16} className="text-blue-500" />
            ) : (
              <LinkIcon size={16} className="text-blue-500" />
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-2">
          {isImageColumn ? (
            <div className="text-center p-4 bg-gray-50 rounded border border-dashed border-gray-300">
              <Image size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Image configuration coming soon</p>
            </div>
          ) : (
            <>
              <SortableContext items={linkIds} strategy={verticalListSortingStrategy}>
                {column.links?.sort((a, b) => a.position - b.position).map((link) => (
                  <DraggableLink
                    key={link._id}
                    link={link}
                    columnId={column._id}
                    dropdownId={dropdownId}
                    onUpdateLink={onUpdateLink}
                    onDeleteLink={onDeleteLink}
                  />
                ))}
              </SortableContext>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 border-dashed"
                onClick={() => onAddLink(dropdownId, column._id)}
              >
                <Plus size={14} className="mr-1" />
                Add Link
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column? This action cannot be undone and all links within the column will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveColumn} className="bg-red-600 hover:bg-red-700">
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DropdownColumn;
