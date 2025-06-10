const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {}; // { roomId: [ws1, ws2] }
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'join') {
      const { roomId } = data;
      ws.roomId = roomId;
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(ws);

      if (rooms[roomId].length === 2) {
        rooms[roomId].forEach(c => c.send(JSON.stringify({ type: 'start' })));
      }
    }

    if (data.type === 'state') {
      const room = rooms[ws.roomId] || [];
      room.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'opponent',
            matrix: data.matrix,
            score: data.score
          }));
        }
      });
    }

    if (data.type === 'chat') {
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat',
            nickname: data.nickname,
            message: data.message
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    const room = rooms[ws.roomId];
    if (room) {
      rooms[ws.roomId] = room.filter(client => client !== ws);
      if (rooms[ws.roomId].length === 0) delete rooms[ws.roomId];
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');