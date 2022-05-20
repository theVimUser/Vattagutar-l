const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const io = require('socket.io')(5000, {
  cors: {
    origin: ['http://192.168.0.168:3000']
  }
});
var configFile = require('./config.json');
const usersFile = require('./users.json');
app.use(express.json());
app.use(
  cors({
    origin: 'http://192.168.0.168:3000'
  })
);

//websockets
io.on('connection', socket => {
  //updating msg's for gorup chat
  socket.on('send-msg-groups', (msg, username, typedMsg, groupName) => {

    console.log('connected');
    let group = require(`./groups/${groupName}.json`);

    group.chat.push({ [username]: typedMsg });

    fs.writeFile(`./groups/${groupName}.json`, JSON.stringify(group, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
    });

    io.emit('recive-msg-groups', group.chat);
  });

  //updating msg's for dm chat
  socket.on('send-msg-dm', (msg, username, fUsername) => {
    var dmFile;
    var tryOrCatch;

    try {
      dmFile = require(`./personal/${username}&${fUsername}.json`);
      tryOrCatch = 'try';
    } catch (err) {
      dmFile = require(`./personal/${fUsername}&${username}.json`);
      tryOrCatch = 'catch';
    }

    dmFile.chat.push({
      [username]: msg
    });

    if (tryOrCatch == 'try') {
      fs.writeFile(`./personal/${username}&${fUsername}.json`, JSON.stringify(dmFile), (err) => {
        if (err) console.log(err);
      });
    } else {
      fs.writeFile(`./personal/${fUsername}&${username}.json`, JSON.stringify(dmFile), (err) => {
        if (err) console.log(err);
      });
    }

    io.emit('recive-msg-dm', dmFile.chat);
  });

  //accepting friend request 
  socket.on('accept-request', (data) => {
    //this is the user who sent the request
    const toAcceptUser = data.toAcceptUser;
    var toAcceptUserIndex = -1;

    //this is the user who accepted the request
    const userIndex = data.userIndex;
    const username = usersFile.users[userIndex].username;

    //finding toAcceptUserIndex
    for (let i = 0; i <= usersFile.users.length; i++) {
      toAcceptUserIndex++;

      if (usersFile.users[i].username == toAcceptUser) {
        break;
      }
    }

    usersFile.users[userIndex].incomingRequests.splice(toAcceptUser, 1);
    usersFile.users[userIndex].friends.push(toAcceptUser);

    usersFile.users[toAcceptUserIndex].sentRequest.splice(username, 1);
    usersFile.users[toAcceptUserIndex].friends.push(username);

    fs.writeFile('./users.json', JSON.stringify(usersFile, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
    });

    configFile.dmChatLayout.permittedUsers.push(toAcceptUser, username);

    //creating the chat file 
    fs.writeFile(`./personal/${username}&${toAcceptUser}.json`, JSON.stringify(configFile.dmChatLayout), (err) => {
      if (err) console.log(err);
    });

    io.emit('added-friend', username, toAcceptUser);
  });
});

//importing routes
const loginRoute = require('./routes/login');
const signUpRoute = require('./routes/sign-up');
const loadChatData = require('./routes/load-chat-data');
const friendRequest = require('./routes/add-friend');
const joinGroup = require('./routes/join-group');
const createGroup = require('./routes/create-group');
const changeUsername = require('./routes/change-username');
const changePassword = require('./routes/change-password');
const loadFriendRequests = require('./routes/load-friend-requests');
const declineRequest = require('./routes/decline-request');
const reloadChat = require('./routes/reload-chat');
const addPerson = require('./routes/add-person');
const loadGroups = require('./routes/load-groups');
const leaveGroup = require('./routes/leave-group');
const changeGroupName = require('./routes/change-group-name');
const removeUser = require('./routes/remove-user');
const unFriendUser = require('./routes/un-friend-user');

app.get('/', (req, res) => {
  res.send('Hello world');
});

//sending the latest msg to clients connected to server
app.use('/reload-chat', reloadChat);

//loggin in a user
app.use('/login', loginRoute);

//creating a new user
app.use('/sign-up', signUpRoute);

//send chat data
app.use('/load-chat-data', loadChatData);

//friend request
app.use('/friend-request', friendRequest);

//join group
app.use('/join-group', joinGroup);

//creates a group
app.use('/create-group', createGroup);

//changing username
app.use('/change-username', changeUsername);

//changing password 
app.use('/change-password', changePassword);

//loading friend requests
app.use('/load-friend-requests', loadFriendRequests);

//declining a request
app.use('/decline-request', declineRequest);

//adding people to a group
app.use('/add-person', addPerson);

//loading groups
app.use('/load-groups', loadGroups);

//leaving group 
app.use('/leave-group', leaveGroup);

//changing group name
app.use('/change-group-name', changeGroupName);

//kicking / removing user out of the group
app.use('/remove-user', removeUser);

//unfriending a user
app.use('/un-friend-user', unFriendUser);

app.listen(process.env.PORT || 4000);