import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data, dataKey, label }) {
  return (
    <div className="p-4 bg-white shadow rounded-lg h-64">
      <h3 className="font-semibold mb-2">{label} (последние 60 секунд)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" interval="auto" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
