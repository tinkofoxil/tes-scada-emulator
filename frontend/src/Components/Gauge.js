// src/components/Gauge.js
import React from 'react';
import GaugeChart from 'react-gauge-chart';

export default function Gauge({ label, value, min, max }) {
  // нормируем в диапазон 0–1
  const raw = (value - min) / (max - min);
  const percent = Math.max(0, Math.min(1, raw));

  // флаг выхода за пределы
  const isAlarm = value < min || value > max;

  return (
    <div
      className={`p-4 shadow rounded-lg ${isAlarm ? 'border-2 border-red-500' : 'border'}`}
      style={{ width: 200 /* px */ }}
    >
      <h3 className="text-center font-semibold mb-2">{label}</h3>
      <GaugeChart
        id={label}
        nrOfLevels={20}
        percent={percent}
        arcPadding={0.02}
        textColor={isAlarm ? '#e3342f' : '#333'}
        formatTextValue={(_val) => `${Math.round(percent * 100)}%`}
      />
      <p className={`text-center mt-2 ${isAlarm ? 'text-red-600' : ''}`}>
        {value.toFixed(1)} {label.includes('Уровень') ? '%' : label.includes('Давление') ? 'bar' : '°C'}
      </p>
    </div>
  );
}
