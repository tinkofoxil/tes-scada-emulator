// backend/index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// -- 1. Инициализируем стартовые данные и контролы --
let sensorData = {
  temperature: 300,  // градусы Цельсия
  pressure:    80,   // бары
  waterLevel:  50,   // проценты
};

let controls = {
  heatValve:   0.5,  // 0…1
  waterPump:   false,
  coolingFan:  false,
};

let currentScenario = 'standard'; // 'standard' | 'boiler-fault' | 'peak-load'


function simulate(prev, controls, scenario) {
  let { temperature, pressure, waterLevel } = prev;

  let faultFactor = scenario === 'boiler-fault' ? 2 : scenario === 'peak-load' ? 1.2 : 1;

  const tempDelta = ((controls.heatValve - 0.2) * 2 * faultFactor)
                  + (controls.coolingFan ? -1.5 : -0.5);
  temperature = +(temperature + tempDelta).toFixed(1);

  // Давление растёт с температурой, падает с насосом
  const pumpEffect = controls.waterPump ? -0.3 : 0.1;
  pressure = +Math.max(0, pressure + (temperature - prev.temperature) * 0.02 + pumpEffect).toFixed(2);

  // Уровень воды: растёт самотёком, падает насосом
  const levelDelta = controls.waterPump ? -0.8 : 0.3;
  waterLevel = +Math.min(100, Math.max(0, waterLevel + levelDelta * faultFactor)).toFixed(1);

  return { temperature, pressure, waterLevel };
}

// -- 3. При подключении шлём текущие данные и слушаем команды --
io.on('connection', socket => {
  // сразу отдаём клиенту реальное состояние
  socket.emit('sensor-data', { ...sensorData, controls });

  // когда клиент меняет контролы
  socket.on('control-update', newControls => {
    controls = { ...controls, ...newControls };
  });

  // смена сценария
  socket.on('scenario-change', sc => {
    currentScenario = sc;
  });
});

// -- 4. Периодически обновляем данные и вещаем всем клиентам --
setInterval(() => {
  sensorData = simulate(sensorData, controls, currentScenario);
  console.log('→ sensorData', sensorData);
  io.emit('sensor-data', { ...sensorData, controls });
}, 1000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
