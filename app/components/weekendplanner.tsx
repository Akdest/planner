"use client";
import { useState, useEffect } from "react";

interface EventData {
  day: string;
  time: string;
  event: string;
}

const DayPlanner = () => {
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

  // Delete a time slot
  const deleteTimeSlot = (time: string) => {
    const updatedSlots = timeSlots.filter((slot) => slot !== time);
    setTimeSlots(updatedSlots);

    // Remove events associated with the deleted time slot
    const updatedEvents = events.filter((event) => event.time !== time);
    setEvents(updatedEvents);
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

  // Delete event
  const deleteEvent = (day: string, time: string) => {
    const updatedEvents = events.filter((e) => !(e.day === day && e.time === time));
    setEvents(updatedEvents);
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Custom Weekday Planner</h1>

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
                className="border p-2 text-center font-semibold cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                onClick={() => openTimeEditModal(time)}
              >
                {time}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal from opening
                    deleteTimeSlot(time);
                  }}
                  className="ml-2 text-red-600"
                >
                  ❌
                </button>
              </div>

              {/* Time Slots */}
              {daysOfWeek.map((day) => {
                const event = events.find((e) => e.day === day && e.time === time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className="border p-4 text-center cursor-pointer hover:bg-blue-200 transition flex justify-between items-center"
                    onClick={() => openEventModal(day, time)}
                  >
                    {event ? (
                      <>
                        {event.event}{" "}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening
                            deleteEvent(day, time);
                          }}
                          className="ml-2 text-red-600"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      "+"
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayPlanner;
