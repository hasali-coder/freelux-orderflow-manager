
import React, { useState } from 'react';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { CalendarEvent } from '@/components/calendar/CalendarEvent';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';

export default function CalendarPage() {
  const { orders } = useData();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  // Navigation functions
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Convert orders to calendar events (focusing on deadlines)
  const orderEvents = orders.map(order => ({
    id: order.id,
    title: order.title,
    date: new Date(order.deadline),
    type: 'deadline',
    clientId: order.clientId,
    status: order.status,
    color: order.status === 'overdue' ? 'destructive' : 
           order.status === 'complete' ? 'success' : 'primary'
  }));

  // Filter events for the selected day
  const eventsForSelectedDay = selectedDate 
    ? orderEvents.filter(event => selectedDate && isSameDay(event.date, selectedDate))
    : [];

  // Get month start and end dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your schedule and project deadlines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <CardDescription>Project deadlines and scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full pointer-events-auto"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              numberOfMonths={1}
              showOutsideDays
              modifiers={{
                hasEvent: (date) =>
                  orderEvents.some(event => isSameDay(date, event.date)),
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold',
                  textDecoration: 'underline', 
                },
              }}
            />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => setIsEventModalOpen(true)}
                  disabled={!selectedDate}
                >
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDay.length > 0 ? (
                <div className="space-y-2">
                  {eventsForSelectedDay.map((event) => (
                    <CalendarEvent key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  {selectedDate ? 'No events for this day.' : 'Select a day to view events.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CalendarEventModal
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
