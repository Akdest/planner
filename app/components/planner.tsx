"use client";
import { useState, useEffect } from "react";

interface EventData {
  day: string;
  time: string;
  event: string;
}

const Planner = () => {
  const [timeSlots, setTimeSlots] = useState(["6:00-7:30"]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Load events from LocalStorage on mount
    
    const [isClient, setIsClient] = useState(false);
  
 
  

  const loadEvents = (): EventData[] => {
    const savedEvents = localStorage.getItem("plannerEvents");
    return savedEvents ? JSON.parse(savedEvents) : [];
  };

  const [events, setEvents] = useState<EventData[]>(loadEvents());
  const [selectedCell, setSelectedCell] = useState<{ day: string; time: string } | null>(null);
  const [eventText, setEventText] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");

  // Save events to LocalStorage whenever events state changes
  useEffect(() => {
    setIsClient(true); // Ensures localStorage is only accessed on the client
    const savedEvents = localStorage.getItem("plannerEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("plannerEvents", JSON.stringify(events));
    }
  }, [events, isClient]);


  // Function to add custom time slots
  const addTimeSlot = () => {
    if (customStartTime && customEndTime) {
      const newSlot = `${customStartTime} - ${customEndTime}`;
      setTimeSlots([...timeSlots, newSlot]);
      setCustomStartTime("");
      setCustomEndTime("");
    }
  };

  // Open modal for adding/modifying events
  const openModal = (day: string, time: string) => {
    setSelectedCell({ day, time });
    const existingEvent = events.find((e) => e.day === day && e.time === time);
    setEventText(existingEvent ? existingEvent.event : "");
  };

  // Save event
  const saveEvent = () => {
    if (selectedCell) {
      const updatedEvents = events.filter(
        (e) => !(e.day === selectedCell.day && e.time === selectedCell.time)
      );
      updatedEvents.push({ day: selectedCell.day, time: selectedCell.time, event: eventText });
      setEvents(updatedEvents);
      setSelectedCell(null);
      setEventText("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Custom Weekly Planner</h1>

      {/* Custom Time Slot Input */}
      <div className="flex gap-2 justify-center mb-4">
        <input
          type="time"
          value={customStartTime}
          onChange={(e) => setCustomStartTime(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={customEndTime}
          onChange={(e) => setCustomEndTime(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={addTimeSlot} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Time Slot
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] md:max-h-[80vh]">
        {/* Planner Grid */}
        <div className="grid grid-cols-8 min-w-[700px] border">
          {/* Header Row */}
          <div className="border p-2 font-bold text-center">Time / Day</div>
          {daysOfWeek.map((day) => (
            <div key={day} className="border p-2 font-bold text-center">
              {day}
            </div>
          ))}

          {/* Time Slot Rows */}
          {timeSlots.map((time) => (
            <div key={time} className="contents">
              {/* Time Column */}
              <div className="border p-2 text-center font-semibold">{time}</div>

              {/* Time Slots */}
              {daysOfWeek.map((day) => {
                const event = events.find((e) => e.day === day && e.time === time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="border p-4 text-center cursor-pointer hover:bg-blue-200 transition"
                    onClick={() => openModal(day, time)}
                  >
                    {event ? event.event : "+"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {selectedCell && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add/Edit Event</h2>
            <p className="text-gray-700 mb-2">
              <strong>{selectedCell.day}</strong> - <strong>{selectedCell.time}</strong>
            </p>
            <input
              type="text"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              placeholder="Enter event"
              className="border p-2 w-full rounded mb-4"
            />
            <div className="flex gap-2">
              <button onClick={saveEvent} className="bg-green-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setSelectedCell(null)} className="bg-red-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
