
import React, { useState } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Grid3X3, Plus, Image, Link } from 'lucide-react';
import DropdownColumn from './DropdownColumn';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Removed TypeScript interface and props typing
const DropdownEditor = ({ dropdown, onUpdateLink, onAddColumn, onDeleteLink, onAddLink, onUpdateColumn, onRemoveColumn }) => {
  const { toast } = useToast();
  const [columnType, setColumnType] = useState('links');

  // Early return if dropdown is undefined or null
  if (!dropdown) {
    return (
      <Card className="mt-4 bg-red-50 border-red-200">
        <CardContent className="py-6">
          <div className="text-center text-red-500">
            <p>Error: Dropdown data is missing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const columnIds = dropdown.dropdown?.columns?.map(column => `${dropdown._id}-${column._id}`) || [];
  
  const handleAddColumn = (type) => {
    if (dropdown.dropdown?.columns?.length >= 4) {
      toast({
        variant: "destructive",
        title: "Maximum columns exceeded",
        description: "Maximum of 4 columns allowed per dropdown.",
      });
      return;
    }
    
    onAddColumn(dropdown._id, type || columnType);
  };

  return (
    <Card className="mt-4 bg-blue-50 border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <ChevronDown size={20} className="text-blue-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Dropdown for "{dropdown.menuTitle}"
            </h3>
            <p className="text-sm text-gray-600">
              Manage columns and links for this dropdown menu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Grid3X3 size={12} />
              {dropdown.dropdown?.columns?.length || 0}/4 columns
            </Badge>
            
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
              <DropdownMenuContent align="end" className="w-56">
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {dropdown.dropdown?.columns
              ?.sort((a, b) => a.position - b.position)
              .map((column) => (
                <DropdownColumn 
                  key={column._id} 
                  column={column} 
                  dropdownId={dropdown._id}
                  onUpdateLink={onUpdateLink}
                  onDeleteLink={onDeleteLink}
                  onAddLink={onAddLink}
                  onUpdateColumn={onUpdateColumn}
                  onRemoveColumn={onRemoveColumn}
                />
              ))}
          </SortableContext>
        </div>
        {(!dropdown.dropdown?.columns || dropdown.dropdown.columns.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <Grid3X3 size={48} className="mx-auto mb-3 opacity-50" />
            <p>No links added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DropdownEditor;
