import kurento from "kurento-client"

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
      onExistingParticipants(message.userid , message.onExistingUsers)
      break
    case 'receiveVideoAnwser':
      onReceiveVideoAnwser(message.senderid, message.sdpAnwser)
      break
   case 'candidate':
      addIceCandidate(message.userid , message.candidate)
      break
  }
})

function sendMessage(message){
   socket.emit('message',message)
}

function receiveVideo(userid , username){
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
      id : userid,
      username : username, 
      video : video, 
      rtcPeer : null
   }

   participants[user.id] = user

   let options = {
      remoteVideo : video , 
      onicecandidate : onIceCandidate
   }

   user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(err) {
      if (err) {
        return console.error(err);
      }
      this.generateOffer(onOffer);
    });

   let onOffer = (err , offer , wp) => {
         let message ={
            event : 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName, 
            sdpOffer: offer
         }
         sendMessage(message)
   }

   function onIceCandidate(candidate, wp){
      let message ={
         event :  'candidate' , 
         userid: user.id ,
         roomName : roomName,
         candidate: candidate,
      }
      sendMessage(message)
   }
}


function onExistingParticipants(userid , existingUsers){
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
      id : userid,
      username : userName, 
      video : video, 
      rtcPeer : null
   }

   participants[user.id] = user

   let constaints = {
      audio: true,
      video :{
         mandatory : {
            maxWidth :320 , 
            maxFrameRates : 15  ,
            minFrameRates : 15
         }
      }
   }

   let options = {
      remoteVideo : video , 
      onicecandidate : onIceCandidate,
      mediaConstaints : constaints
   }

   user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendvonly(options, function(err) {
      if (err) {
        return console.error(err);
      }
      this.generateOffer(onOffer);
    });

    existingUsers.forEach(element => {
      receiveVideo(element.id , element.name)
    });

   let onOffer = (err , offer , wp) => {
         let message ={
            event : 'receiveVideoFrom',
            userid: user.id,
            roomName: roomName, 
            sdpOffer: offer
         }
         sendMessage(message)
   }

   function onIceCandidate(candidate, wp){
      let message ={
         event :  'candidate' , 
         userid: user.id ,
         roomName : roomName,
         candidate: candidate,
      }
      sendMessage(message)
   }
}
function onReceiveVideoAnwser(senderid, sdpAnwser){
   participants[senderid].rtcPeer.processAnwser(sdpAnwser)
}


function addIceCandidate(userid , candidate){
   participants[userid].rtcPeer.addIceCandidate[candidate]
}
