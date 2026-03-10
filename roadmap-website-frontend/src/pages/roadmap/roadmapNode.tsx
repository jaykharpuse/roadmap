// First, let's create the custom node component in a separate file (RoadmapNode.tsx)
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';
import type { RoadmapNode as RoadmapNodeType } from '@/types/user/roadmap/roadmap-details';

interface RoadmapNodeProps {
  data: RoadmapNodeType & { 
    isExpanded: boolean;
    onExpandToggle: () => void;
    onNodeClick: () => void;
  };
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ data }) => {
  const hasChildren = data.children && data.children.length > 0;
  
  return (
    <div
      className={cn(
        'p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow w-64',
        data.isOptional ? 'border-blue-200' : 'border-gray-200'
      )}
      onClick={data.onNodeClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{data.title}</h3>
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{data.description}</p>
          )}
        </div>
        
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full ml-2"
            onClick={(e) => {
              e.stopPropagation();
              data.onExpandToggle();
            }}
          >
            {data.isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-1">
        {data.estimatedDuration && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {data.estimatedDuration.value} {data.estimatedDuration.unit}
          </Badge>
        )}
        
        {data.metadata?.difficulty && (
          <Badge variant="outline">{data.metadata.difficulty}</Badge>
        )}
        
        {data.isOptional && (
          <Badge variant="secondary">Optional</Badge>
        )}
      </div>
    </div>
  );
};

export default RoadmapNode;