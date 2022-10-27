const express = require('express');
const router = express.Router();
const users = require('../../users.json');
const { MongoClient } = require('mongodb');
//f refers to friend
async function addFriend(res, userIndex, username, fUsername) {
    const uri = 'mongodb+srv://rushabh:suketujan22@test-base.7sxb1.mongodb.net/?retrywrites=true&w=majority'

    const client = new MongoClient(uri);

    try {
        await client.connect();

        var fUserCollection = await client.db('users').collection(fUsername).findOne({});

        if (fUserCollection == null) {
            res.json({
                status: 'failed'
            });
        } else {
            var userCollection = await client.db('users').collection(username).findOne({});

            userCollection.sentRequests.push(fUsername);
            fUserCollection.incomingRequests.push(username);

            await client.db('users').collection(username).replaceOne({}, userCollection, {});
            await client.db('users').collection(fUsername).replaceOne({}, fUserCollection, {});

            res.json({
                status: 'success'
            });
        }
    } catch(err) {
        console.log(err);
    }
}

async function sdf(res, userIndex, username, fUsername) {
    const uri = 'mongodb+srv://rushabh:suketujan22@test-base.7sxb1.mongodb.net/?retrywrites=true&w=majority'

    const client = new mongoclient(uri);

    try {
        await client.connect();

        const users = await client.db('user-data').collection('user').findOne({});

        //writing to incoming requests
        users.users[userIndex].sentRequest.push(fUsername);

        var userFound = false;

        for (var fUserIndex = 0; fUserIndex <= users.users.length - 1; fUserIndex++) {
            if (users.users[fUserIndex].username == fUsername) {
                userFound = true;
                break;
            }
        }

        if (userFound == true) {
            //wrirting to sentRequests
            users.users[fUserIndex].incomingRequests.push(username);

            await client.db('user-data').collection('user').replaceOne({}, users, {});

            res.json({
                status: 'success'
            });
        } else {
            res.json({
                status: 'failed'
            });
        }
    } catch (err) {
        console.log(err);
    }
}

router.post('/', (req, res) => {
    const userIndex = parseInt(req.body.userIndex);
    const username = req.body.username;
    const fUsername = req.body.fUsername;

    addFriend(res, userIndex, username, fUsername);
});

module.exports = router;