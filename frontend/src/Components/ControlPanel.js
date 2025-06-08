import React from 'react';
import { motion } from 'framer-motion';

export default function ControlPanel({ controls, onChange }) {
  return (
    <div className="p-4 bg-white shadow rounded-lg grid grid-cols-1 gap-4">
      <h3 className="font-semibold">Панель управления</h3>
      
      {/* Рычаг тепла */}
      <div>
        <label>Клапан тепла: {Math.round(controls.heatValve * 100)}%</label>
        <input
          type="range" min="0" max="1" step="0.01"
          value={controls.heatValve}
          onChange={e => onChange({ heatValve: +e.target.value })}
          className="w-full"
        />
      </div>

      {/* Кнопка насоса */}
      <div className="flex items-center">
        <label className="mr-2">Насос:</label>
        <button
          onClick={() => onChange({ waterPump: !controls.waterPump })}
          className="px-3 py-1 border rounded"
        >
          {controls.waterPump ? 'Выкл' : 'Вкл'}
        </button>
      </div>

      {/* Кнопка вентилятора */}
      <div className="flex items-center">
        <label className="mr-2">Вентилятор охлаждения:</label>
        <button
          onClick={() => onChange({ coolingFan: !controls.coolingFan })}
          className="px-3 py-1 border rounded"
        >
          {controls.coolingFan ? 'Выкл' : 'Вкл'}
        </button>
      </div>
    </div>
  );
}
