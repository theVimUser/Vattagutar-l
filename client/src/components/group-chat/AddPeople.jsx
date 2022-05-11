import React from 'react';
import io from 'socket.io-client';
import ReactDOM from 'react-dom';
import configFile from '../../config.json';
import Homepage from '../homepage/Homepage';

async function addPerson() {
  const toAddPerson = document.getElementById('personsUsername').value;
  var user = JSON.parse(localStorage.getItem('user'));

  const socket = io(configFile.serverURL);

  if (toAddPerson != '') {
    const currentGroupData = JSON.parse(localStorage.getItem('currentGroupData'));

    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupName: currentGroupData.groupName,
        toAdd: toAddPerson
      })
    }

    const res = await fetch(`${configFile.serverURL}/add-person`, options);
    const data = await res.json();

    if (data.status === 'failed') {
      alert(`User ${toAddPerson} does not exist :(, please try again with a proper username`);
    } else {
      alert(`User ${toAddPerson} is now a member of this group :)`);

      socket.on('connect', () => {
        socket.emit('add-person', {
          userIndex: data.userIndex,
          toAdd: toAddPerson
        });

        socket.on('added-person', (addedPerson) => {
          console.log('Hello world');
          console.log(addedPerson);
        });
      });
    }
  } else {
    alert('Please enter a proper username');
  }
}

export default class AddPeople extends React.Component {
  render() {
    return (
      <div className="addPeople" id="addPeople">
        <h2 className='heading2'>Enter the person's username to add them</h2>

        <input type="text" id="personsUsername" placeholder='Enter a username' className="personsUsername" />

        <br />

        <button className='loginBtn' onClick={addPerson}>Add</button>
      </div>
    );
  }
}
