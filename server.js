var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port);
console.log("Server started on port " + port);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/:id', function(req, res) {
	if (validate(req.params.id)) {
    res.sendFile(__dirname + '/client/chat.html');
  }
	else res.sendFile(__dirname + '/client/index.html');
})

var CLIENTS = [];

io.on('connection', function(socket) {
  console.log('New Connection: ' + socket.id);
  CLIENTS[socket.id] = new client(socket);

  socket.on('join', function(data) {
    if (validate(data.nick) && validate(data.channel) && !dupNick(data.nick, data.channel)) {
      CLIENTS[socket.id].nick = data.nick;
      CLIENTS[socket.id].channel = data.channel;
      let us = getUsers(data.channel);
      socket.emit('ready', {nick: data.nick, channel: data.channel, users: us});
			broadcast('newUser',CLIENTS[socket.id]);
    }
    else socket.emit('errorNick', {msg: "Check your nickname or channel name. It should only contain letters and digits."});
  });

	socket.on('newMsg', function(data) {
		if(data.msg.length > 60000) return;
		data.msg = data.msg.replace(/\s+/, ' ');
		if(data.msg != '' && data.msg != ' ')
			send('newMsg', CLIENTS[socket.id], {nick:CLIENTS[socket.id].nick, msg:data.msg});
	});

	socket.on('isTyping', function(data) {
		CLIENTS[socket.id].isTyping = true;
		send('typing', CLIENTS[socket.id], {users:getUsers(CLIENTS[socket.id].channel)});
	});

	socket.on('isNotTyping', function(data) {
			CLIENTS[socket.id].isTyping = false;
			send('typing', CLIENTS[socket.id], {users:getUsers(CLIENTS[socket.id].channel)});
	});

  socket.on('disconnect', function() {
		var t = {channel: CLIENTS[socket.id].channel, nick: CLIENTS[socket.id].nick};
		CLIENTS[socket.id] = null;
		broadcast('left',t);
    console.log('Disconnected: ' + socket.id);
  });
});


function send(type, clt, data) {
	for (key in CLIENTS) {
    if (CLIENTS[key] && CLIENTS[key] != null) {
      if (CLIENTS[key].channel == clt.channel)
				CLIENTS[key].socket.emit(type, data);
    }
  }
}

function broadcast(type, clt) {
	for (key in CLIENTS) {
    if (CLIENTS[key] && CLIENTS[key] != null) {
      if (CLIENTS[key].channel == clt.channel && CLIENTS[key].nick != clt.nick)
				CLIENTS[key].socket.emit(type, {msg: clt.nick, users:getUsers(clt.channel)});
    }
  }
}

function getUsers(chan) {
  let us = [];
  for (key in CLIENTS) {
    if (CLIENTS[key] && CLIENTS[key] != null) {
      if (CLIENTS[key].channel == chan)
        us.push({nick:CLIENTS[key].nick, isTyping:CLIENTS[key].isTyping});
    }
  }
  return us;
}

function dupNick(nick, chan) {
  for (key in CLIENTS) {
    if (CLIENTS[key] && CLIENTS[key] != null)
      if (CLIENTS[key].channel == chan && CLIENTS[key].nick == nick) return true;
  }
  return false;
}

function client(socket) {
	this.socket = socket;
  this.nick = "";
  this.channel = "";
	this.isTyping = false;
}

function validate(txt) {
  return /^[a-zA-Z0-9]{1,24}$/.test(txt);
}
