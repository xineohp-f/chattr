var nick;
var channel = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
var socket = io();
var v;
var templates = [
  {
    '--dark': '#2C3E50',
    '--gray': '#34495E',
    '--primary': '#1ABC9C',
    '--secondary': '#16A085',
    '--white': '#ecf0f1',
    '--text': '#ddd',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.1)',
    '--input-text': 'white'
  },
  {
    '--dark': '#5c9dff',
    '--gray': '#f4f3f1',
    '--primary': '#3d69aa',
    '--secondary': '#5c9dff',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(0,0,0,0.2)',
    '--input-text': '#333',
  },
  {
    '--dark': '#5c9dff',
    '--gray': '#333',
    '--primary': '#3d69aa',
    '--secondary': '#5c9dff',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.2)',
    '--input-text': 'silver',
  },
  {
    '--dark': '#975dfa',
    '--gray': '#f4f3f1',
    '--primary': '#bbb',
    '--secondary': '#975dfa',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(0,0,0,0.2)',
    '--input-text': '#333'
  },
  {
    '--dark': '#2D2D2A',
    '--gray': '#353831',
    '--primary': '#20FC8F',
    '--secondary': '#33d384',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.2)',
    '--input-text': 'silver'
  },
  {
    '--dark': '#0E1428',
    '--gray': '#202539',
    '--primary': '#F0A202',
    '--secondary': '#F18805',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.2)',
    '--input-text': 'silver'
  },
  {
    '--dark': '#272822',
    '--gray': '#333',
    '--primary': '#c0392b',
    '--secondary': '#e74c3c',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.2)',
    '--input-text': 'silver'
  },
  {
    '--dark': '#272822',
    '--gray': '#333',
    '--primary': '#555',
    '--secondary': '#444',
    '--white': 'white',
    '--text': '#eee',
    '--shadow': 'rgba(0,0,0,0.2)',
    '--background-trans': 'rgba(200,200,200,0.2)',
    '--input-text': 'silver'
  }
];

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
      isTyping: false,
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

      socket.on('typing', function(data) {
        if (data != null) this.users = data.users;
      }.bind(this));
    },
    methods: {
      grow: function() {
        let el = document.getElementById('tarea');
        el.style.height = el.scrollHeight + "px";
        el.style.marginTop = -(el.scrollHeight - 50) + "px";
        if (this.msg != "") {
          if (!this.isTyping) {
            this.isTyping = true;
            socket.emit('isTyping', {});
          }
        }
        else if (this.isTyping) {
          this.isTyping = false;
          socket.emit('isNotTyping', {});
        }
      },
      send: function() {
        socket.emit('newMsg', {msg:this.msg});
        this.isTyping = false;
        socket.emit('isNotTyping', {});
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
    document.getElementById('bar').className = 'clicked';
    document.getElementById('sidebar').className += ' showSide';
  }
  else {
    k.clic = false;
    document.getElementById('bar').className = '';
    document.getElementById('sidebar').className = 'sidebar';
  }
}

function changeTemp(el) {
  var tmpl = templates[el.id];
  for (key in tmpl) {
    document.documentElement.style.setProperty(key, tmpl[key]);
  }
}

function toggleSettings() {
  let k = document.querySelector(".settings");
  if (k.clic == undefined) k.clic = false;
  if (!k.clic) {
    k.clic = true;
    k.className += ' clicked';
    document.getElementById('colors').className += ' show';
  }
  else {
    k.clic = false;
    k.className = 'settings';
    document.getElementById('colors').className = 'colors';
  }
}
