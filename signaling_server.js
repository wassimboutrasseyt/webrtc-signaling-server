// // signaling_server.js
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });

// // Stockage temporaire des utilisateurs connectés
// const connectedUsers = new Map();

// // Route de base
// app.get('/', (req, res) => {
//   res.send('Serveur de signalisation WebRTC en cours d\'exécution');
// });

// io.on('connection', (socket) => {
//   console.log(`Client connecté: ${socket.id}`);
  
//   // Un nouvel utilisateur se connecte avec un nom d'utilisateur
//   socket.on('register', (username) => {
//     console.log(`${username} enregistré avec socketId: ${socket.id}`);
    
//     // Enregistrer l'utilisateur avec son socket ID
//     connectedUsers.set(username, socket.id);
    
//     // Informer tous les utilisateurs de la liste mise à jour
//     io.emit('user_list', Array.from(connectedUsers.keys()));
//   });
  
//   // Un utilisateur souhaite appeler un autre utilisateur
//   socket.on('offer', (data) => {
//     const { target, sdp } = data;
//     const targetSocketId = connectedUsers.get(target);
    
//     if (targetSocketId) {
//       console.log(`Transfert de l'offre à ${target}`);
//       io.to(targetSocketId).emit('offer', {
//         from: getUsernameBySocketId(socket.id),
//         sdp: sdp
//       });
//     }
//   });
  
//   // Réponse à une offre
//   socket.on('answer', (data) => {
//     const { target, sdp } = data;
//     const targetSocketId = connectedUsers.get(target);
    
//     if (targetSocketId) {
//       console.log(`Transfert de la réponse à ${target}`);
//       io.to(targetSocketId).emit('answer', {
//         from: getUsernameBySocketId(socket.id),
//         sdp: sdp
//       });
//     }
//   });
  
//   // Échange de candidats ICE
//   socket.on('ice_candidate', (data) => {
//     const { target, candidate } = data;
//     const targetSocketId = connectedUsers.get(target);
    
//     if (targetSocketId) {
//       console.log(`Transfert du candidat ICE à ${target}`);
//       io.to(targetSocketId).emit('ice_candidate', {
//         from: getUsernameBySocketId(socket.id),
//         candidate: candidate
//       });
//     }
//   });
  
//   // Déconnexion
//   socket.on('disconnect', () => {
//     const username = getUsernameBySocketId(socket.id);
//     if (username) {
//       console.log(`${username} déconnecté`);
//       connectedUsers.delete(username);
      
//       // Informer tous les utilisateurs de la liste mise à jour
//       io.emit('user_list', Array.from(connectedUsers.keys()));
//     }
//   });
// });

// // Fonction utilitaire pour obtenir le nom d'utilisateur à partir du socketId
// function getUsernameBySocketId(socketId) {
//   for (const [username, id] of connectedUsers.entries()) {
//     if (id === socketId) {
//       return username;
//     }
//   }
//   return null;
// }

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Serveur de signalisation démarré sur le port ${PORT}`);
// });