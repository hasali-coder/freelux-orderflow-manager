
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';

interface CalendarEventProps {
  event: {
    id: string;
    title: string;
    date: Date;
    type: string;
    clientId?: string;
    status?: string;
    color?: string;
  };
}

export function CalendarEvent({ event }: CalendarEventProps) {
  const { getClientById } = useData();
  const client = event.clientId ? getClientById(event.clientId) : null;

  const getBadgeVariant = () => {
    switch(event.color) {
      case 'destructive': return 'destructive';
      case 'success': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="flex items-start p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant()} className="capitalize">
            {event.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(event.date, 'h:mm a')}
          </span>
        </div>
        
        <Link
          to={event.type === 'deadline' ? `/orders/${event.id}` : '#'}
          className="block font-medium mt-1 hover:underline"
        >
          {event.title}
        </Link>
        
        {client && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            Client: {client.name}
          </p>
        )}
      </div>
    </div>
  );
}
