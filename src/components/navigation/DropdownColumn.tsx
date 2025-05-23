
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DropdownColumn as DropdownColumnType } from '@/types/navigation';
import { GripVertical, Image, Link } from 'lucide-react';
import DraggableLink from './DraggableLink';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Removed TypeScript interface and props typing
const DropdownColumn = ({ column, dropdownId, onUpdateLink }) => {
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

  const linkIds = column.links.map(link => `${column._id}-${link._id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="h-full border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <div className="flex items-center gap-2 flex-1">
              {column.type === 'image' ? (
                <Image size={16} className="text-purple-600" />
              ) : (
                <Link size={16} className="text-blue-600" />
              )}
              <span className="font-medium text-gray-900">
                {column.type === 'image' ? 'Image Banner' : column.title}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              #{column.position}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {column.type === 'image' ? (
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <Image size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{column.image?.altText}</p>
                <p className="text-xs text-gray-500 truncate">{column.image?.url}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <SortableContext items={linkIds} strategy={verticalListSortingStrategy}>
                {column.links
                  .sort((a, b) => a.position - b.position)
                  .map((link) => (
                    <DraggableLink 
                      key={link._id} 
                      link={link} 
                      columnId={column._id} 
                      onUpdateLink={onUpdateLink}
                    />
                  ))}
              </SortableContext>
              {column.links.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No links added yet
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DropdownColumn;
