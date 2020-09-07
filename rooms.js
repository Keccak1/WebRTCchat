const { v4: uuidV4 } = require('uuid');
const bcrypt = require("bcrypt");

class Room {
    constructor(name) {
        this.name = name;
        this.hash = uuidV4();
        this.users = new Array();
        this.pass = null;
    }

    async setPassword(pass) {
        this.pass = await bcrypt.hash(pass, 10);
    }

    userExists(user_name) { return this.users.includes(user_name); }
    addUser(user_name) { this.users.push(user_name); }
    removeUser(user_name) {
        const user_index = this.users.findIndex(user_name);
        this.users.splice(user_index, 1);
    }

    isEmpty() { return this.users.length == 0 }
}

class ChatRooms {
    constructor(max_users) {
        this.rooms = new Array();
        this.nextRoomName = null;
        this.nextUserName = null;
        this.maxUsers = max_users;
    }

    setNextUser(user_name) {
        this.nextUserName = user_name;
        console.log("nextuser", user_name);
    }

    findRoom(room_name) {
        return this.rooms.find(room => room.name == room_name);
    }

    getRoom(room_name) {
        exists = this.findRoom(room_name)
    }
    setNextRoom(room) {
        console.log("next room", room);
        this.nextRoomName = room;
    }

    reset() {
        this.nextRoomName = null;
        this.nextRoomName = null;
    }

    async addUserToRoom(body) {
        let current_room = null
        const { name, room, password } = body;
        current_room = this.findRoom(room);
        if (current_room) {
            const password_hash = await bcrypt.compare(password, room.hash)
            if (password_hash) {
                if (current_room.users.length == this.maxUsers) {
                    throw new Error(`${room} is full`);
                }

                if (current_room.userExists(name)) {
                    throw new Error(`${name} in ${room} already exists`);
                }
            }
            else {
                throw Error("Wrong Password to room");
            }
        } else {
            current_room = new Room(room);
            await current_room.setPassword(password);
            this.rooms.push(current_room);
        }
        current_room.addUser(name);
        this.setNextRoom(current_room);
        this.setNextUser(name);
        return current_room
    }

    removeUserFromRoom(body) {
        const rooms = this.findRoom(room_name);
        if (rooms.length) {
            room = rooms[0]
            if (room.userExists(user_name)) {
                room.removeUser(user_name);
                if (room.isEmpty()) {
                    const rooom_index = this.rooms.findIndex(room);
                    rooms.splice(rooom_index, 1);
                }
            } else {
                throw new Error(`${user_name} not exists in room ${room_name}`);
            }
        } else {
            throw new Error(`${room_name} not exists`);
        }
    }
}

module.exports = {
    Room,
    ChatRooms
};