
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/types/navigation';
import { GripVertical, ExternalLink, ChevronDown, ChevronUp, Plus, Link, Image, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MenuItemCardProps {
  item: MenuItem;
  dropdown?: any;
  isExpanded?: boolean;
  onAddColumn?: (dropdownId: string, type: 'links' | 'image') => void;
  onDeleteMenuItem?: (menuItemId: string) => void;
  onToggleExpanded?: (menuItemId: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  dropdown, 
  isExpanded = false,
  onAddColumn, 
  onDeleteMenuItem,
  onToggleExpanded 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item._id,
    data: {
      type: 'menuItem',
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddColumn = (type: 'links' | 'image') => {
    if (dropdown && onAddColumn) {
      onAddColumn(dropdown._id, type);
    }
  };

  const handleDelete = () => {
    if (onDeleteMenuItem) {
      onDeleteMenuItem(item._id);
    }
  };

  const handleToggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded(item._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                {item.hasDropdown && (
                  <ChevronDown size={16} className="text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ExternalLink size={14} />
                <span className="truncate">{item.url}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Position #{item.position}</Badge>
                
                {item.hasDropdown && (
                  <>
                    <Badge variant="secondary" className="text-xs">
                      Has Dropdown
                    </Badge>
                    
                    {dropdown && onAddColumn && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            disabled={dropdown.dropdown?.columns?.length >= 4}
                          >
                            <Plus size={14} />
                            Add Column
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
                          <DropdownMenuItem onClick={() => handleAddColumn('links')} className="gap-2">
                            <Link size={16} />
                            Links Column
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddColumn('image')} className="gap-2">
                            <Image size={16} />
                            Image Column
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {dropdown && onToggleExpanded && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleExpanded}
                        className="flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            Expand
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.title}"? This action cannot be undone.
                        {item.hasDropdown && " This will also delete the associated dropdown menu."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MenuItemCard;
