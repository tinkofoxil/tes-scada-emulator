// src/App.js

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

import Gauge from './Components/Gauge';
import TrendChart from './Components/TrendChart';
import ControlPanel from './Components/ControlPanel';
import EventLog from './Components/EventLog';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const socket = io('http://localhost:4000', {
  transports: ['websocket'],  // сразу сразу пробуем WebSocket
  reconnectionAttempts: 5,
  timeout: 2000
});

socket.on('connect', () => console.log('✅ connected, socket.id =', socket.id));
socket.on('connect_error', err => console.error('❌ connection error', err));

function App() {
  const [current, setCurrent] = useState({ temperature: 0, pressure: 0, waterLevel: 0 });
  const [controls, setControls] = useState({ heatValve: 0.5, waterPump: false, coolingFan: false });
  const [history, setHistory]   = useState([]);
  const [events, setEvents]     = useState([]);
  const [scenario, setScenario] = useState('standard');
  const [score, setScore]       = useState(1000);

  useEffect(() => {
    let delta = 0;
    const { temperature, pressure, waterLevel } = current;
    if (temperature < 200 || temperature > 600) delta -= 5;
    if (pressure    <   0 || pressure    > 150) delta -= 5;
    if (waterLevel  <   0 || waterLevel  > 100) delta -= 5;
    if (delta) {
      setScore(s => Math.max(0, s + delta));
      const reason =
        temperature < 200 || temperature > 600
          ? 'Температура'
          : pressure < 0 || pressure > 150
          ? 'Давление'
          : 'Уровень воды';
      toast.error(`Нарушение: ${reason}`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, [current]);

  useEffect(() => {
    socket.on('sensor-data', data => {
      console.log('← received', data);
      const { temperature, pressure, waterLevel } = data;
      setCurrent({ temperature, pressure, waterLevel });
      const time = new Date().toLocaleTimeString();
      setHistory(prev => [...prev.slice(-59), { time, ...data }]);
    });
    return () => {
      socket.off('sensor-data');
    };
  }, []);

  // корректируем очки при выходе за пределы
  useEffect(() => {
    let delta = 0;
    const { temperature, pressure, waterLevel } = current;
    if (temperature < 200 || temperature > 600) delta -= 5;
    if (pressure    <   0 || pressure    > 150) delta -= 5;
    if (waterLevel  <   0 || waterLevel  > 100) delta -= 5;
    if (delta) {
      setScore(s => Math.max(0, s + delta));
      setEvents(ev => [
        ...ev,
        {
          time: new Date().toLocaleTimeString(),
          text: `Нарушение: ${
            temperature<200||temperature>600
              ? 'Температура'
              : pressure<0||pressure>150
              ? 'Давление'
              : 'Уровень воды'
          }`,
        },
      ]);
    }
  }, [current]);

  const handleControlChange = delta => {
    const key = Object.keys(delta)[0], val = delta[key];
    setControls(c => ({ ...c, ...delta }));
    setEvents(ev => [
      ...ev,
      {
        time: new Date().toLocaleTimeString(),
        text:
          key === 'heatValve'
            ? `Клапан тепла: ${Math.round(val*100)}%`
            : key === 'waterPump'
            ? `Насос: ${val?'Вкл':'Выкл'}`
            : `Вентилятор: ${val?'Вкл':'Выкл'}`,
      },
    ]);
    socket.emit('control-update', delta);
  };

  const handleScenarioChange = e => {
    setScenario(e.target.value);
    setEvents([]);
    setScore(1000);
    socket.emit('scenario-change', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      {/* Левая панель */}
      <motion.div className="lg:col-span-1 flex flex-col gap-6"
        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }}>
        <ControlPanel controls={controls} onChange={handleControlChange}/>
        <div className="p-4 bg-white shadow rounded-lg">
          <label className="block font-semibold mb-2">Сценарий эмуляции:</label>
          <select value={scenario} onChange={handleScenarioChange}
                  className="w-full border p-2 rounded">
            <option value="standard">Стандарт</option>
            <option value="boiler-fault">Авария котла</option>
            <option value="peak-load">Пиковая нагрузка</option>
          </select>
        </div>
        <div className="p-4 bg-white shadow rounded-lg text-lg font-semibold">
          Очки: {score}
        </div>
        <EventLog events={events}/>
      </motion.div>

      {/* Гейджи в ряд */}
      <div className="lg:col-span-3 flex flex-wrap justify-between gap-4">
        {[
          { label:'Температура (°C)', value:current.temperature, min:200, max:600 },
          { label:'Давление (bar)',    value:current.pressure,    min:0,   max:150 },
          { label:'Уровень воды (%)',  value:current.waterLevel,  min:0,   max:100 },
        ].map((g,i)=>(
          <div key={i} className="w-1/3 max-w-xs">
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.1 }}>
              <Gauge label={g.label} value={g.value} min={g.min} max={g.max}/>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <TrendChart data={history} dataKey="temperature" label="Температура"/>
        <TrendChart data={history} dataKey="pressure"    label="Давление"/>
        <TrendChart data={history} dataKey="waterLevel"  label="Уровень воды"/>
      </div>
    </div>
  );
}

export default App;
