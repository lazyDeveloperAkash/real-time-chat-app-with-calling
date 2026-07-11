const socketIo = require("socket.io");

function initializeSocketIo(server, options) {
    const io = socketIo(server, options);

    let clients = new Map();
    let socketIds = new Map();
    let groups = [];

    io.on("connection", (socket) => {
        // store data to an array
        socket.on("storeClientInfo", ({ contact }) => {
            clients.set(contact, socket.id)
            socketIds.set(socket.id, contact);
        })

        // message section ------------------------
        // send message
        socket.on('send-message', ({ receaver, message }) => {
            if (clients.has(receaver.contact))
                io.to(clients.get(receaver.contact)).emit('new-message', { incomingMessage: message, sender: receaver });
        })

        socket.on('join-to-room', ({ rooms }) => {
            rooms.map((e) => {
                socket.join(e);
            })
        })

        socket.on('group-msg', ({ groupId, msg, name, id }) => {
            io.to(groupId).emit('group-message', { msg, name, id: id });
        })

        // ----------------------------------handle calls ---------------------------------------------

        socket.on('call-init', ({ name, callType, receaver, callerContact, offer }) => {
            if (clients.has(receaver))
                io.to(clients.get(receaver)).emit('incoming-call', { callerName: name, callerContact, callType, offer });
        })
        socket.on("call-status", (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.contact);
            receaver && io.to(receaver.socketId).emit('call-status', { peerId: data.peerId, name: data.name, contact: data.contact });
        })
        socket.on('send-call-offer', ({ callerContact, offer })=> {
            if (clients.has(callerContact))
                io.to(clients.get(callerContact)).emit('receave-stream', {offer});
        })

        socket.on('call-disconect', (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.contact);
            receaver && io.to(receaver.socketId).emit('call-disconect', true);
        })

        // handle disconnect
        socket.on('disconnect', function () {
            clients.delete(socketIds.get(socket.id));
            socketIds.delete(socket.id);
            console.log("user disconected !");
        });
    })
    return io;
}

module.exports = initializeSocketIo