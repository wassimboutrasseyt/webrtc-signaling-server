// const express = require('express');
// const app = express()
// let http =require('http').Server(app)
// let minimist = require('minimist')
// let io = require('socket.io')(http)
// const kurento = require('kurento-client');
// const { get } = require('https');
// const { pipeline } = require('stream');
// const { send } = require('process');

// let kurentoClient = null
// let iceCandidateQueues = {}

// let argv = minimist(process.argv.slice(2),{
//     default :{
//         as_uri: 'http://localhost:3000',
//         ws_uri: 'ws://localhost:8888/kurento'
//     }
// })

// io.on('Connection',socket =>{
//     socket.on('message', message =>{
//         switch(message.event){
//             case 'joinRoom':
//                 joinRoom(socket,message.userName,message.roomName, err =>{
//                     if(err){
//                         console.log(err)
//                     }
//                 })
//                 break
//             case 'receiveVideoFrom':
//                 receiveVideoFrom(socket, message.userid, message.roomName, message.sdpOffer ,err =>{
//                     if(err){
//                         console.log(err)
//                     }
//                 })
//                 break
//             case 'candidate' :
//                 addIceCandidate(socket, message.userid , message.roomName, message.candidate, err=>{
//                     if(err){
//                         console.log(err)
//                     }
//                 })
//                 break
//         }
//     })
// })

// function joinRoom(socket , username , roomname , callBack){
//     getRoom(socket , roomname , (err , myRoom) =>{
//         if(err)
//             {console.log(err)}

//         myRoom.pipeline.create('webRtcEndPoint' ,(err , outgoingMedia)=>{
//             if(err){
//                 return callBack(err)
//             }

//             let user ={
//                 id : socket.id,
//                 name :username,
//                 outgoingMedia : outgoingMedia,
//                 incomingMedia : {}
//             }

//             let iceCandidateQueue = iceCandidateQueues[user.id]
//             if(iceCandidateQueue){
//                 while(iceCandidateQueue.length){
//                     let ice =  iceCandidateQueue.shift()
//                     user.outgoingMedia.addIceCandidate(ice.candidate)
//                 }
//             }

//             user.outgoingMedia.on('OnIceCandidate', event =>{
//                 let candidate = kurento.register.complexTypes.IceCandidate(event.candidate)
//                 socket.emit('message',{
//                     event : 'candidate',
//                     userid : user.id, 
//                     candidate : candidate
//                 })
//             })

//             socket.to(roomname).emit('message', {
//                 event : 'newParticipantArrived',
//                 userid : user.id,
//                 username : user.name
//             })
//             let existingUsers = []
//             for(let i in myRoom.participants){
//                 if(myRoom.participants[i].id != user.id){
//                     existingUsers.push({
//                         id : myRoom.participants[i].id,
//                         name : myRoom.participants[i].name,
//                     })
//                 }
//             }

//             socket.emit('message' ,{
//                 event : 'existingParticipants', 
//                 existingUsers : existingUsers,
//                 userid : user.id
//             })

//             myRoom.participants[user.id] = user
//         })
//     })
// }

// function getKurentoClient(callBack){
//     if(kurentoClient !== null){
//         return callBack(null , kurentoClient)
//     }

//     kurento(argv.ws_uri , (err , _kurentoClient) =>{
//         if(err){
//             console.log(err)
//             return callBack(err)
//         }
//         kurentoClient = _kurentoClient
//         callBack(null, kurentoClient)
//     })
// }

// function getRoom(socket , roomname , callBack){
//     let myRoom = io.socket.adapter.rooms[roomname] || (length = 0)
//     let numClient = myRoom.length

//     if(numClient == 0){
//         socket.join(roomname,() => {
//             myRoom = io.socket.adapter.rooms[roomname]
//             getKurentoClient((err, kurento) =>{
//                 kurento.create('MediaPipeLine' ,(err,pipeline)=>{
//                     myRoom.pipeline = pipeline
//                     myRoom.participants = {}
//                     callBack(null, myRoom)
//                 })
//             }) 
//         })
//     } else{
//         socket.join(roomname)
//         callBack(null, myRoom)
//     }
// }

// function getEndPointForUser(socket , roomname , senderid , callBack){
//     let myRoom = io.socket.adapter.rooms[roomname]
//     let asker = myRoom.participants[socket.id]
//     let sender = myRoom.participants[senderid]

//     if(asker.id === sender.id){
//         return callBack(null , asker.outgoingMedia)
//     }

//     if(asker.incomingMedia[sender.id]){
//         send.outgoingMedia.connect(asker.incomingMedia[sender.id] , err =>{
//             if(err){
//                 return callBack(err)
//             }
//             callBack(null, asker.incomingMedia[sender.id])
//         })
//     } else{

//         myRoom.pipeline.create('webRtcEndPoint' ,(err , incoming)=>{
//             if(err){
//                 return callBack(err)
//             }

//             asker.incomingMedia[sender.id] = incoming

//             let iceCandidateQueue = iceCandidateQueues[sender.id]
//             if(iceCandidateQueue){
//                 while(iceCandidateQueue.length){
//                     let ice =  iceCandidateQueue.shift()
//                     sender.outgoingMedia.addIceCandidate(ice.candidate)
//                 }
//             }

//             sender.outgoingMedia.on('OnIceCandidate', event =>{
//                 let candidate = kurento.register.complexTypes.IceCandidate(event.candidate)
//                 socket.emit('message',{
//                     event : 'candidate',
//                     userid : sender.id, 
//                     candidate : candidate
//                 })
//             })
//             send.outgoingMedia.connect(incoming , err =>{
//                 if(err){
//                     return callBack(err)
//                 }
//                 callBack(null, incoming)
//             })

//         })
//     }
// }

// function receiveVideoFrom(socket, userid, roomName, sdpOffer, callBack){
//     getEndPointForUser(socket, roomName ,userid ,(err , endpoint)=>{
//         if(err){ return callBack(err)}
//         endpoint.processOffer(sdpOffer, (err , sdpAnwser)=>{
//             if(err){ return callBack(err)}

//             socket.emit('message',{
//                 event: 'receiveVideoAnwser' , 
//                 senderid : userid,
//                 sdpAnwser : sdpAnwser
//             })

//             endpoint.gatherCandidates(err =>{
//                 if(err){return callBack(err)}
//             })
//         })
//     })
// }

// function addIceCandidate(socket , senderid , roomName ,iceCandidate , callBack){
//     let user = io.socket.adapter.rooms[roomName].participants[socket.id]
//     if(user != null){
//         let candidate = kurento.register.complexTypes.IceCandidate(iceCandidate)
//         if(senderid == user.id){
//             if(user.outgoingMedia){
//                 user.outgoingMedia.addIceCandidate(candidate)
//             } else{
//                 iceCandidateQueues[user.id].push({
//                     candidate : candidate
//                 })
//             }
//         } else{
//             if(user.incomingMedia[senderid]){
//                 user.incomingMedia[senderid].addIceCandidate(candidate)
//             } else{
//                 if(iceCandidateQueues[senderid]){
//                     iceCandidateQueues[senderid] = []
//                 }
//                 iceCandidateQueues[senderid].push({candidate : candidate})
//             }

//         }
//         callBack(null)

//     } else{
//         callBack(new Error("addIceCandidate failed"))
//     }
// }

// app.use(express.static('public'))

// http.listen(3000,()=>{
//     console.log('App is running')
// })

const express = require('express');
const app = express()
let http = require('http').Server(app)
let minimist = require('minimist')
let io = require('socket.io')(http)
const kurento = require('kurento-client');
const { get } = require('https');
const { pipeline } = require('stream');
const { send } = require('process');

let kurentoClient = null
let iceCandidateQueues = {}

let argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'http://localhost:3000',
        ws_uri: 'ws://localhost:8888/kurento'
    }
})

io.on('connection', socket => {
    socket.on('message', message => {
        switch (message.event) {
            case 'joinRoom':
                joinRoom(socket, message.userName, message.roomName, err => {
                    if (err) {
                        console.log(err)
                    }
                })
                break
            case 'receiveVideoFrom':
                receiveVideoFrom(socket, message.userid, message.roomName, message.sdpOffer, err => {
                    if (err) {
                        console.log(err)
                    }
                })
                break
            case 'candidate':
                addIceCandidate(socket, message.userid, message.roomName, message.candidate, err => {
                    if (err) {
                        console.log(err)
                    }
                })
                break
        }
    })
})

function joinRoom(socket, username, roomname, callBack) {
    getRoom(socket, roomname, (err, myRoom) => {
        if (err) {
            console.log(err)
            return callBack(err)
        }

        myRoom.pipeline.create('WebRtcEndpoint', (err, outgoingMedia) => {
            if (err) {
                return callBack(err)
            }

            let user = {
                id: socket.id,
                name: username,
                outgoingMedia: outgoingMedia,
                incomingMedia: {}
            }

            // Initialize ice candidate queue if it doesn't exist
            if (!iceCandidateQueues[user.id]) {
                iceCandidateQueues[user.id] = []
            }

            let iceCandidateQueue = iceCandidateQueues[user.id]
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift()
                    user.outgoingMedia.addIceCandidate(ice.candidate)
                }
            }

            user.outgoingMedia.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate)
                socket.emit('message', {
                    event: 'candidate',
                    userid: user.id,
                    candidate: candidate
                })
            })

            socket.to(roomname).emit('message', {
                event: 'newParticipantArrived',
                userid: user.id,
                username: user.name
            })
            let existingUsers = []
            for (let i in myRoom.participants) {
                if (myRoom.participants[i].id != user.id) {
                    existingUsers.push({
                        id: myRoom.participants[i].id,
                        name: myRoom.participants[i].name,
                    })
                }
            }

            socket.emit('message', {
                event: 'existingParticipants',
                existingUsers: existingUsers,
                userid: user.id
            })

            myRoom.participants[user.id] = user
        })
    })
}

function getKurentoClient(callBack) {
    if (kurentoClient !== null) {
        return callBack(null, kurentoClient)
    }

    kurento(argv.ws_uri, (err, _kurentoClient) => {
        if (err) {
            console.log(err)
            return callBack(err)
        }
        kurentoClient = _kurentoClient
        callBack(null, kurentoClient)
    })
}

function getRoom(socket, roomname, callBack) {
    let myRoom = io.sockets.adapter.rooms[roomname] || { length: 0 }
    let numClient = myRoom.length

    if (numClient == 0) {
        socket.join(roomname, () => {
            myRoom = io.sockets.adapter.rooms[roomname]
            getKurentoClient((err, kurento) => {
                if (err) {
                    return callBack(err)
                }
                kurento.create('MediaPipeline', (err, pipeline) => {
                    if (err) {
                        return callBack(err)
                    }
                    myRoom.pipeline = pipeline
                    myRoom.participants = {}
                    callBack(null, myRoom)
                })
            })
        })
    } else {
        socket.join(roomname)
        callBack(null, myRoom)
    }
}

function getEndPointForUser(socket, roomname, senderid, callBack) {
    let myRoom = io.sockets.adapter.rooms[roomname]
    let asker = myRoom.participants[socket.id]
    let sender = myRoom.participants[senderid]

    if (asker.id === sender.id) {
        return callBack(null, asker.outgoingMedia)
    }

    if (asker.incomingMedia[sender.id]) {
        sender.outgoingMedia.connect(asker.incomingMedia[sender.id], err => {
            if (err) {
                return callBack(err)
            }
            callBack(null, asker.incomingMedia[sender.id])
        })
    } else {
        myRoom.pipeline.create('WebRtcEndpoint', (err, incoming) => {
            if (err) {
                return callBack(err)
            }

            asker.incomingMedia[sender.id] = incoming

            // Initialize ice candidate queue if it doesn't exist
            if (!iceCandidateQueues[sender.id]) {
                iceCandidateQueues[sender.id] = []
            }

            let iceCandidateQueue = iceCandidateQueues[sender.id]
            if (iceCandidateQueue) {
                while (iceCandidateQueue.length) {
                    let ice = iceCandidateQueue.shift()
                    sender.outgoingMedia.addIceCandidate(ice.candidate)
                }
            }

            incoming.on('OnIceCandidate', event => {
                let candidate = kurento.register.complexTypes.IceCandidate(event.candidate)
                socket.emit('message', {
                    event: 'candidate',
                    userid: sender.id,
                    candidate: candidate
                })
            })
            
            sender.outgoingMedia.connect(incoming, err => {
                if (err) {
                    return callBack(err)
                }
                callBack(null, incoming)
            })
        })
    }
}

function receiveVideoFrom(socket, userid, roomName, sdpOffer, callBack) {
    getEndPointForUser(socket, roomName, userid, (err, endpoint) => {
        if (err) { return callBack(err) }
        endpoint.processOffer(sdpOffer, (err, sdpAnswer) => {
            if (err) { return callBack(err) }

            socket.emit('message', {
                event: 'receiveVideoAnswer',
                senderid: userid,
                sdpAnswer: sdpAnswer
            })

            endpoint.gatherCandidates(err => {
                if (err) { return callBack(err) }
            })
        })
    })
}

function addIceCandidate(socket, senderid, roomName, iceCandidate, callBack) {
    const room = io.sockets.adapter.rooms[roomName]
    if (!room || !room.participants) {
        return callBack(new Error("Room not found or no participants"))
    }
    
    let user = room.participants[socket.id]
    if (user != null) {
        let candidate = kurento.register.complexTypes.IceCandidate(iceCandidate)
        if (senderid == user.id) {
            if (user.outgoingMedia) {
                user.outgoingMedia.addIceCandidate(candidate)
            } else {
                if (!iceCandidateQueues[user.id]) {
                    iceCandidateQueues[user.id] = []
                }
                iceCandidateQueues[user.id].push({
                    candidate: candidate
                })
            }
        } else {
            if (user.incomingMedia[senderid]) {
                user.incomingMedia[senderid].addIceCandidate(candidate)
            } else {
                if (!iceCandidateQueues[senderid]) {
                    iceCandidateQueues[senderid] = []
                }
                iceCandidateQueues[senderid].push({ candidate: candidate })
            }
        }
        callBack(null)
    } else {
        callBack(new Error("addIceCandidate failed: User not found"))
    }
}

app.use(express.static('public'))

http.listen(3000, () => {
    console.log('App is running')
})