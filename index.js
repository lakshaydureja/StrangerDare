const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.use(express.static('public'));


let RandomQueue = [];
let roomCodes = new Set();


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);


  // ? below random
  socket.on('initRandom', () => {

    if (RandomQueue.length >= 1) {
      const socketId2 = RandomQueue.shift();
      matchup(io, socket.id, socketId2);
    } else {
      RandomQueue.push(socket.id);
    }

  });



  // ?below room
  socket.on('joinRoomCreate', (roomCode) => {


    socket.emit('waiting');


  });

  socket.on('joinRoomJoin', (roomCode) => {

    if (roomCodes.has(roomCode)) {
      roomCodes.delete(roomCode); 
      socket.emit('roomFound');

    } else {
      socket.emit('roomNotFound');
    }

  });


  // Store any session data if needed (optional)
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


app.get('/', detectDeviceType, (req, res) => {
  if (req.isMobile) {
    res.render('indexM.ejs');
  } else {
    res.render('indexW.ejs');
  }
});

app.get('/playzoneRandom', detectDeviceType, (req, res) => {
  if (req.isMobile) {
    res.redirect('playzoneM');
  } else {
    res.redirect('playzoneW');
   // res.redirect('playzoneM');// for testing

  }
});
app.get('/playzoneW', (req, res) => {
  res.render('playzoneW.ejs');
});
app.get('/playzoneM', (req, res) => {
  res.render('playzoneM.ejs');
});




app.get('/createRoom', detectDeviceType, (req, res) => {
  //6-digit room code
  const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store the room with some initial data
  roomCodes.add(roomCode);

  if (req.isMobile) {
    res.redirect(`/playzoneM?roomCode=${roomCode}`);
  } else {
    res.redirect(`/playzoneW?roomCode=${roomCode}`);
  }
});
app.get('/playzoneW', (req, res) => {
  res.render('playzoneW.ejs', { roomCode: req.query.roomCode });
});
app.get('/playzoneM', (req, res) => {
  res.render('playzoneM.ejs', { roomCode: req.query.roomCode });
});


app.get('/joinroom', detectDeviceType, (req, res) => {
  const roomCode = req.query.roomCode;

  if (req.isMobile) {
    res.redirect(`/playzoneM?joinRoom=${roomCode}`);
  } else {
    res.redirect(`/playzoneW?joinRoom=${roomCode}`);
  }
});





// Start the server on a specified port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Middleware to detect if the user is on mobile or web
function detectDeviceType(req, res, next) {
  const userAgent = req.headers['user-agent'].toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  // Attach the device type to the request object
  req.isMobile = isMobile;
  next();
}







//? functions 

//genrate room for random 
function generateRoomId() {
  return uuidv4();
}

function matchup(io, socketId1, socketId2) {
  console.log('Matched up users:', socketId1, socketId2);

  const roomId = generateRoomId();
  console.log('Generated room ID:', roomId);

  const socket1 = io.sockets.sockets.get(socketId1);
  const socket2 = io.sockets.sockets.get(socketId2);

  if (socket1 && socket2) {

    setTimeout(() => {
      socket2.emit('matchedAnswer', { roomId });
    }, 1000);

    setTimeout(() => {
      socket1.emit('matchedCall', { roomId });
    }, 1000);
    console.log(`Room ${roomId} assigned to ${socketId1} and ${socketId2}`);
  } else {
    if (socket1) {
      socket1.emit('refresh');
    } else {
      socket2.emit('refresh');
    }
    console.log(`One of the sockets is missing: socket1 (${socketId1}) or socket2 (${socketId2}) so refreshing page`);
  }
}