
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { NavigationLink } from '@/types/navigation';
import { GripVertical, ExternalLink } from 'lucide-react';

interface DraggableLinkProps {
  link: NavigationLink;
  columnId: string;
}

const DraggableLink: React.FC<DraggableLinkProps> = ({ link, columnId }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="p-3 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {link.label}
              </span>
              <ExternalLink size={12} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 truncate">{link.url}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
            #{link.position}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DraggableLink;
