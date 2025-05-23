
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types/navigation';
import { GripVertical, ExternalLink, ChevronDown } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
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
              <Badge variant="outline">Position #{item.position}</Badge>
              {item.hasDropdown && (
                <Badge variant="secondary" className="text-xs">
                  Has Dropdown
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MenuItemCard;
