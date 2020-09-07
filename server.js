const express = require('express')
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const { ChatRooms } = require('./rooms');
const { maxUsersInRoom} = require('./config');

const chat_rooms = new ChatRooms(maxUsersInRoom);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render(`enter`, { data: {} });
});

app.post('/connect', async (req, res) => {
    try {
        room = await chat_rooms.addUserToRoom(req.body);
        res.redirect(`/${room.hash}`);
    } catch (e) {
        console.log(e.message)
        res.render(`enter`, { data: { err: e } })
    }
});

app.get('/:room', (req, res) => {
    const room = chat_rooms.nextRoomName;
    const user = chat_rooms.nextUserName;
    console.log(room)
    console.log(user)
    if (room && user) {
        res.render('room', { data: { room: { hash: room.hash, name: room.name }, user: user } })
    } else {
        res.render(`enter`, { data: {err: Error("First log in")} });
    }
    chat_rooms.reset();
})

const port = 8000 || process.env.PORT

server.listen(port, () => {
    console.log(`Listening on ${port}`);
});


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        });
    })

    socket.on('disconnect', (roomId, userId) => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId);
        console.log(userId)
    }); 
})


