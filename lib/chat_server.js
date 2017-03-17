var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
    io = socketio.listen(server); //启动io服务器，允许搭载在已有服务器上
    io.set('log level', 1);

    io.sockets.on('connection', function(socket) { //定义每个用户连接的处理
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); //用户链接上了以后分配一个用户名
        joinRoom(socket, 'Lobby'); //进入大厅

        handleMessgeBroadcasting(socket, nickNames); //处理用户消息
        handleNameChangeAttempts(socket, nickNames, namesUsed); //处理更名
        handleRoomJoining(socket); //处理聊天室创建和变更

        socket.on('rooms', function() { //用户发起请求时,提供已经被占用的聊天室列表
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket, nickNames, namesUsed); //用户断开后清除
    });
};