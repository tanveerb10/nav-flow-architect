
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { NavigationLink } from '@/types/navigation';
import { GripVertical, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DraggableLinkProps {
  link: NavigationLink;
  columnId: string;
}

const DraggableLink: React.FC<DraggableLinkProps> = ({ link, columnId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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
              <span className="text-sm font-medium text-gray-900 truncate">
                {link.label}
              </span>
              <ExternalLink size={12} className="text-gray-400" />
            </div>
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
              #{link.position}
            </span>
          </div>
          
          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t text-sm text-gray-500">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                <span className="font-medium">URL:</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {link.url}
                </a>
                
                <span className="font-medium">ID:</span>
                <span className="font-mono text-xs bg-gray-100 p-1 rounded">{link._id}</span>
                
                <span className="font-medium">Position:</span>
                <span>{link.position}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default DraggableLink;
