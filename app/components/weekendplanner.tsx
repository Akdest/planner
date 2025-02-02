"use client";
import { useState, useEffect } from "react";

interface EventData {
  day: string;
  time: string;
  event: string;
}

const EndPlanner = () => {
  // Load time slots from localStorage if available
  const loadTimeSlots = (): string[] => {
    if (typeof window !== "undefined") {
      const savedTimeSlots = localStorage.getItem("plannerTimeSlots");
      return savedTimeSlots ? JSON.parse(savedTimeSlots) : ["06:00 - 07:30"];
    }
    return ["06:00 - 07:30"];
  };

  const daysOfWeek = ["Saturday", "Sunday"];

  // Load events from localStorage
  const loadEvents = (): EventData[] => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("plannerEvents");
      return savedEvents ? JSON.parse(savedEvents) : [];
    }
    return [];
  };

  const [timeSlots, setTimeSlots] = useState<string[]>(loadTimeSlots());
  const [events, setEvents] = useState<EventData[]>(loadEvents());
  const [selectedCell, setSelectedCell] = useState<{ day: string; time: string } | null>(null);
  const [eventText, setEventText] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Save events and time slots to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("plannerEvents", JSON.stringify(events));
      localStorage.setItem("plannerTimeSlots", JSON.stringify(timeSlots));
    }
  }, [events, timeSlots]);

  // Parse and compare times for sorting
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes);
  };

  // Function to add or edit a time slot
  const saveTimeSlot = () => {
    if (customStartTime && customEndTime) {
      const newSlot = `${customStartTime} - ${customEndTime}`;

      let updatedSlots = [...timeSlots];

      if (selectedTimeSlot) {
        // Edit existing time slot
        updatedSlots = updatedSlots.map((slot) => (slot === selectedTimeSlot ? newSlot : slot));
        setSelectedTimeSlot(null);
      } else {
        // Add new time slot if it's not a duplicate
        if (!timeSlots.includes(newSlot)) {
          updatedSlots.push(newSlot);
        }
      }

      // Sort the time slots in ascending order
      updatedSlots.sort((a, b) => {
        const [startA] = a.split(" - ");
        const [startB] = b.split(" - ");
        return parseTime(startA).getTime() - parseTime(startB).getTime();
      });

      setTimeSlots(updatedSlots);
      setCustomStartTime("");
      setCustomEndTime("");
    }
  };

  // Open modal for adding/modifying events
  const openEventModal = (day: string, time: string) => {
    setSelectedCell({ day, time });
    const existingEvent = events.find((e) => e.day === day && e.time === time);
    setEventText(existingEvent ? existingEvent.event : "");
  };

  // Open modal to edit a time slot
  const openTimeEditModal = (time: string) => {
    setSelectedTimeSlot(time);
    const [start, end] = time.split(" - ");
    setCustomStartTime(start);
    setCustomEndTime(end);
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
      <h1 className="text-2xl font-bold text-center mb-4">Custom Week-End Planner</h1>

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
        <button onClick={saveTimeSlot} className="bg-blue-500 text-white px-4 py-2 rounded">
          {selectedTimeSlot ? "Update Time Slot" : "Add Time Slot"}
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] md:max-h-[80vh]">
        {/* Planner Grid */}
        <div className="grid grid-cols-3 min-w-[700px] border">
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
              {/* Time Column - Clickable for Editing */}
              <div
                className="border p-2 text-center font-semibold cursor-pointer hover:bg-gray-200"
                onClick={() => openTimeEditModal(time)}
              >
                {time}
              </div>

              {/* Time Slots */}
              {daysOfWeek.map((day) => {
                const event = events.find((e) => e.day === day && e.time === time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="border p-4 text-center cursor-pointer hover:bg-blue-200 transition"
                    onClick={() => openEventModal(day, time)}
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

export default EndPlanner;
