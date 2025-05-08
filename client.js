// import kurento from "kurento-client"

// let divRoomSelection = document.getElementById('roomSelection')
// let divMeetingRoom = document.getElementById('room')
// let inputRoom = document.getElementById('roomName')
// let inputName = document.getElementById('name')
// let btnRegister = document.getElementById('register')

// // Variables
// let roomName
// let userName
// let participants = {}

// let socket = io()

// btnRegister.onclick = () => {
//   roomName = inputRoom.value
//   userName = inputName.value

//   if (roomName === '' || userName === '') {
//     alert('Room and name are required')
//   } else {
//     let message = {
//       event: 'joinRoom',
//       userName: userName,
//       roomName: roomName
//     }

//     sendMessage(message)
//     divRoomSelection.style = 'display: none'
//     divMeetingRoom.style = 'display: block'
//   }
// }

// socket.on('message', message => {
//   console.log('Message arrived', message.event)

//   switch (message.event) {
//     case 'newParticipantArrived':
//       receiveVideo(message.userid, message.username)
//       break
//     case 'existingParticipants':
//       onExistingParticipants(message.userid , message.onExistingUsers)
//       break
//     case 'receiveVideoAnwser':
//       onReceiveVideoAnwser(message.senderid, message.sdpAnwser)
//       break
//    case 'candidate':
//       addIceCandidate(message.userid , message.candidate)
//       break
//   }
// })

// function sendMessage(message){
//    socket.emit('message',message)
// }

// function receiveVideo(userid , username){
//    let video = document.createElement('video')
//    let div = document.createElement('div')
//    div.className = 'videoContainer'
//    let name = document.createElement('div')
//    video.id = userid
//    video.autoplay = true
//    name.appendChild(document.createTextNode(username))
//    div.appendChild(video)
//    div.appendChild(name)
//    divMeetingRoom.appendChild(div)

//    let user = {
//       id : userid,
//       username : username, 
//       video : video, 
//       rtcPeer : null
//    }

//    participants[user.id] = user

//    let options = {
//       remoteVideo : video , 
//       onicecandidate : onIceCandidate
//    }

//    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(err) {
//       if (err) {
//         return console.error(err);
//       }
//       this.generateOffer(onOffer);
//     });

//    let onOffer = (err , offer , wp) => {
//          let message ={
//             event : 'receiveVideoFrom',
//             userid: user.id,
//             roomName: roomName, 
//             sdpOffer: offer
//          }
//          sendMessage(message)
//    }

//    function onIceCandidate(candidate, wp){
//       let message ={
//          event :  'candidate' , 
//          userid: user.id ,
//          roomName : roomName,
//          candidate: candidate,
//       }
//       sendMessage(message)
//    }
// }


// function onExistingParticipants(userid , existingUsers){
//    let video = document.createElement('video')
//    let div = document.createElement('div')
//    div.className = 'videoContainer'
//    let name = document.createElement('div')
//    video.id = userid
//    video.autoplay = true
//    name.appendChild(document.createTextNode(userName))
//    div.appendChild(video)
//    div.appendChild(name)
//    divMeetingRoom.appendChild(div)

//    let user = {
//       id : userid,
//       username : userName, 
//       video : video, 
//       rtcPeer : null
//    }

//    participants[user.id] = user

//    let constaints = {
//       audio: true,
//       video :{
//          mandatory : {
//             maxWidth :320 , 
//             maxFrameRates : 15  ,
//             minFrameRates : 15
//          }
//       }
//    }

//    let options = {
//       remoteVideo : video , 
//       onicecandidate : onIceCandidate,
//       mediaConstaints : constaints
//    }

//    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendvonly(options, function(err) {
//       if (err) {
//         return console.error(err);
//       }
//       this.generateOffer(onOffer);
//     });

//     existingUsers.forEach(element => {
//       receiveVideo(element.id , element.name)
//     });

//    let onOffer = (err , offer , wp) => {
//          let message ={
//             event : 'receiveVideoFrom',
//             userid: user.id,
//             roomName: roomName, 
//             sdpOffer: offer
//          }
//          sendMessage(message)
//    }

//    function onIceCandidate(candidate, wp){
//       let message ={
//          event :  'candidate' , 
//          userid: user.id ,
//          roomName : roomName,
//          candidate: candidate,
//       }
//       sendMessage(message)
//    }
// }
// function onReceiveVideoAnwser(senderid, sdpAnwser){
//    participants[senderid].rtcPeer.processAnwser(sdpAnwser)
// }


// function addIceCandidate(userid , candidate){
//    participants[userid].rtcPeer.addIceCandidate[candidate]
// }


// This is client-side code, no need for kurento-client import
// Remove: import kurento from "kurento-client"

let divRoomSelection = document.getElementById('roomSelection')
let divMeetingRoom = document.getElementById('room')
let inputRoom = document.getElementById('roomName')
let inputName = document.getElementById('name')
let btnRegister = document.getElementById('register')

// Variables
let roomName
let userName
let participants = {}

let socket = io()

btnRegister.onclick = () => {
  roomName = inputRoom.value
  userName = inputName.value

  if (roomName === '' || userName === '') {
    alert('Room and name are required')
  } else {
    let message = {
      event: 'joinRoom',
      userName: userName,
      roomName: roomName
    }

    sendMessage(message)
    divRoomSelection.style = 'display: none'
    divMeetingRoom.style = 'display: block'
  }
}

socket.on('message', message => {
  console.log('Message arrived', message.event)

  switch (message.event) {
    case 'newParticipantArrived':
      receiveVideo(message.userid, message.username)
      break
    case 'existingParticipants':
      onExistingParticipants(message.userid, message.existingUsers)
      break
    case 'receiveVideoAnswer':
      onReceiveVideoAnswer(message.senderid, message.sdpAnswer)
      break
    case 'candidate':
      addIceCandidate(message.userid, message.candidate)
      break
  }
})

function sendMessage(message) {
  socket.emit('message', message)
}

function receiveVideo(userid, username) {
  let video = document.createElement('video')
  let div = document.createElement('div')
  div.className = 'videoContainer'
  let name = document.createElement('div')
  video.id = userid
  video.autoplay = true
  name.appendChild(document.createTextNode(username))
  div.appendChild(video)
  div.appendChild(name)
  divMeetingRoom.appendChild(div)

  let user = {
    id: userid,
    username: username,
    video: video,
    rtcPeer: null
  }

  participants[user.id] = user

  let options = {
    remoteVideo: video,
    onicecandidate: onIceCandidate
  }

  user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(err) {
    if (err) {
      return console.error(err);
    }
    this.generateOffer(onOffer);
  });

  function onOffer(err, offer, wp) {
    let message = {
      event: 'receiveVideoFrom',
      userid: user.id,
      roomName: roomName,
      sdpOffer: offer
    }
    sendMessage(message)
  }

  function onIceCandidate(candidate, wp) {
    let message = {
      event: 'candidate',
      userid: user.id,
      roomName: roomName,
      candidate: candidate,
    }
    sendMessage(message)
  }
}

function onExistingParticipants(userid, existingUsers) {
  let video = document.createElement('video')
  let div = document.createElement('div')
  div.className = 'videoContainer'
  let name = document.createElement('div')
  video.id = userid
  video.autoplay = true
  name.appendChild(document.createTextNode(userName))
  div.appendChild(video)
  div.appendChild(name)
  divMeetingRoom.appendChild(div)

  let user = {
    id: userid,
    username: userName,
    video: video,
    rtcPeer: null
  }

  participants[user.id] = user

  let constraints = {
    audio: true,
    video: {
      mandatory: {
        maxWidth: 320,
        maxFrameRate: 15,
        minFrameRate: 15
      }
    }
  }

  let options = {
    localVideo: video,
    onicecandidate: onIceCandidate,
    mediaConstraints: constraints
  }

  user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(err) {
    if (err) {
      return console.error(err);
    }
    this.generateOffer(onOffer);
  });

  if (existingUsers && Array.isArray(existingUsers)) {
    existingUsers.forEach(element => {
      receiveVideo(element.id, element.name)
    });
  } else {
    console.error("existingUsers is not an array or is undefined", existingUsers);
  }

  function onOffer(err, offer, wp) {
    let message = {
      event: 'receiveVideoFrom',
      userid: user.id,
      roomName: roomName,
      sdpOffer: offer
    }
    sendMessage(message)
  }

  function onIceCandidate(candidate, wp) {
    let message = {
      event: 'candidate',
      userid: user.id,
      roomName: roomName,
      candidate: candidate,
    }
    sendMessage(message)
  }
}

function onReceiveVideoAnswer(senderid, sdpAnswer) {
  if (participants[senderid] && participants[senderid].rtcPeer) {
    participants[senderid].rtcPeer.processAnswer(sdpAnswer);
  } else {
    console.error("Cannot process answer: participant or rtcPeer not found", senderid);
  }
}

function addIceCandidate(userid, candidate) {
  if (participants[userid] && participants[userid].rtcPeer) {
    participants[userid].rtcPeer.addIceCandidate(candidate);
  } else {
    console.error("Cannot add ICE candidate: participant or rtcPeer not found", userid);
  }
}