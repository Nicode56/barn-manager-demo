import React from "react";
import { lessonSlots } from "@/demo-data/lessons";

export const LessonSchedulePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Lesson Scheduling</h1>

      <ul className="space-y-4">
        {lessonSlots.map(slot => (
          <li
            key={slot.id}
            className="bulletin-item"
            style={{ opacity: slot.available ? 1 : 0.5 }}
          >
            {slot.time} {slot.available ? "" : "(Full)"}
          </li>
        ))}
      </ul>
    </div>
  );
};