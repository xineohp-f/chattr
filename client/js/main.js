var nick;
var channel = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
var socket = io();
var v;

function grow(el) {
  el.style.height = el.scrollHeight + "px";
  el.style.marginTop = -(el.scrollHeight - 50) + "px";
}

function check(event) {
  if (event.keyCode === 13) {
    var n = document.getElementById('myNick').value;
    if (validate(n)) {
      socket.emit('join', {nick: n, channel: channel});
    }
    else notif("Your username should contain only letters and digits.");
  }
}

socket.on('ready', function(data) {

  v = new Vue({
    el: '#app',
    data: {
      users: data.users,
      messages: [],
      nick: data.nick,
      channel: data.channel,
      msg: ''
    },
    created: function() {
      socket.on('newUser', function(data) {
        this.messages.push({
          msg: data.msg + ' joined the chat!',
          class: 'info'
        });
        this.users = data.users;
      }.bind(this));
      socket.on('left', function(data) {
        this.messages.push({
          msg: data.msg + ' left the chat!',
          class: 'info'
        });
        this.users = data.users;
      }.bind(this));
      socket.on('newMsg', function(data) {
        if (this.messages.length >= 1 && this.messages[this.messages.length-1].nick == data.nick) {
          this.messages[this.messages.length-1].msg += '\n' + data.msg;
        }
        else this.messages.push({nick: data.nick, msg:data.msg, class:'message'});
        setTimeout(function() {window.scrollTo(0,document.body.scrollHeight)}, 300);
      }.bind(this));
    },
    methods: {
      grow: function() {
        let el = document.getElementById('tarea');
        el.style.height = el.scrollHeight + "px";
        el.style.marginTop = -(el.scrollHeight - 50) + "px";
      },
      send: function() {
        socket.emit('newMsg', {msg:this.msg});
        this.msg = "";
        document.getElementById('tarea').style.height = "50px";
        document.getElementById('tarea').style.marginTop = "0px";
      }
    }
  });
  document.getElementById('login').className += " hide-up";
  setTimeout(function(){document.getElementById('login').style.display = "none";}, 300);
  document.getElementById('sidebar').className += " slide-left";
  document.getElementById('sidebar').style.display = "block";
  document.getElementById('u-info').className += " slide-left";
  document.getElementById('u-info').style.display = "block";
  document.getElementById('menu-bar').className += " slide-left";
  document.getElementById('chat-box').className += " slide-Up";
  document.getElementById('chat-box').style.display = "block";
  document.getElementById('tarea').focus();
});

socket.on('errorNick', function(data) {
  notif(data.msg);
  document.getElementById('myNick').value = "";
  document.getElementById('myNick').focus();
});

function validate(t) {
  return /^[a-zA-Z0-9]{1,24}$/.test(t);
}

function notif(msg) {
  document.getElementById('notif').style.display = "block";
  document.getElementById('notif').innerHTML = msg;
  document.getElementById('notif').className = "notif";
  document.getElementById('notif').className = "notif slide-down";
  setTimeout("clearNotif()", 3000);
}

function clearNotif() {
  document.getElementById('notif').innerHTML = "";
  document.getElementById('notif').style.display = "none";
}

function checkC(event) {
  if (event.keyCode === 13) {
    if (validate(document.getElementById('myChannel').value)) {
      window.location.href="/"+document.getElementById('myChannel').value;
    }
    else notif("Channel name can contain only letters and digits.");
  }
}

function toggleSidebar() {
  let k = document.getElementById('menu-bar');
  if (k.clic == undefined) k.clic = false;
  if (!k.clic) {
    k.clic = true;
    k.className += " slideL";
    document.getElementById('sidebar').className += ' showSide';
  }
  else {
    k.clic = false;
    document.getElementById('sidebar').className = 'sidebar';
    k.className = "menu-bar";
  }
}
