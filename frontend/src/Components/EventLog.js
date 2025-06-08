import React from 'react';

export default function EventLog({ events }) {
  return (
    <div className="p-4 bg-white shadow rounded-lg max-h-64 overflow-auto">
      <h3 className="font-semibold mb-2">Журнал событий</h3>
      <ul className="text-sm">
        {events.map((e, i) => (
          <li key={i} className="border-b py-1">
            <span className="text-gray-500">{e.time}</span> — {e.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
