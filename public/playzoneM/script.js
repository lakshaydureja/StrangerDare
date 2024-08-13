const bottle = document.getElementById("bottle");
const base = document.getElementById("base");
const cntrlBtnDone = document.getElementById("done");
const cntrlBtnSkip = document.getElementById("skip");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const msgBtn = document.getElementById("btnSend");
const micBtn = document.getElementById("btnMic");
const camBtn = document.getElementById("btnCam");
const loadingContainer = document.getElementById('loadingContainer');
const roomCodeDiv = document.getElementById('roomcode');
const WaitContainer = document.getElementById('WaitContainer');
const headline = document.getElementById('headline');


let myStream;
let isAudioMuted = false;
let isVideoMuted = false;
let roomCodeForRoom; //for room
let currentUrl = '/playzoneRandom';


let DataConnection = null;

const socket = io();
// const peer = new Peer({
//     host: 'your-peerjs-server-host', // Your PeerJS server host
//     port: 9000, // Your PeerJS server port
//     path: '/peerjs'
// });
let peer;
// const peer = new Peer();
let roomCodeRandoom;

const urlParams = new URLSearchParams(window.location.search);
const roomCodeCreate = urlParams.get("roomCode");
const roomCodeJoin = urlParams.get("joinRoom");
let roomCodeGlobal;


socket.on("connect", () => {
    console.log("Connected with socket ID:", socket.id);
    startCamera();
});

socket.on("refresh", () => {
    //if user connected with socket that dont exist
    window.location.href = '/playzoneRandom';
});

// Handle disconnection
socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
});

if (roomCodeCreate) {
    //*******for room play */
    console.log("room play");
    showRoomCode(roomCodeCreate);
    roomCodeGlobal = roomCodeCreate
    skiptoend()
    socket.emit("joinRoomCreate", roomCodeCreate);
} else if (roomCodeJoin) {
    showRoomCode(roomCodeJoin);
    roomCodeGlobal = roomCodeJoin
    socket.emit("joinRoomJoin", roomCodeJoin);
    skiptoend()



} else {
    //*******for radom play */
    console.log("random play");

    window.onload = () => {
        // showLoading();
        hideLoading();
        socket.emit("initRandom");
    };
}

// ? below is room

socket.on("waiting", () => {
    console.log("Waiting for another participant...");

    hideLoading();
    showWaiting();
    //change button skip to end
    ToastLong("Share your Code: "+ roomCodeGlobal);


    peer = new Peer(roomCodeGlobal);

    console.log("Peer ID:--", peer.id);




    peer.on('call', call => {

        call.answer(myStream);

        call.on('stream', remoteStream => {
            hideWaiting();

            remoteVideo.srcObject = remoteStream;
        });
    })

    peer.on('connection', function (conn) {
        DataConnection = conn;

        conn.on('open', function () {
            console.log("its working");

            conn.on('data', function (data) {
                if (data.type === "message") {
                    const receivedMessage = data.message;
                    createMessageBubble(receivedMessage, false)
                } else if (data.type === "angle") {
                    const recievedAngle = data.angle;
                    const receivedDuration = data.duration;
                    spinBottle(recievedAngle, receivedDuration);
                    cntrlBtnDone.textContent = '👀';
                    setTimeout(() => {
                        cntrlBtnDone.textContent = 'Spin';
                    }, 30000)

                } else if (data.type === "left") {
                    Toast('Stranger left');
                    countdownAndSkip();
                }
            });
        });
    });

});

socket.on("roomFound", (participants) => {
    //change button skip to end
    console.log("Joined room with participants:", participants);
    hideLoading();
    showWaiting();

    peer = new Peer();

    peer.on("open", (id) => {
        console.log("Peer ID:", id);
        const call = peer.call(roomCodeGlobal, myStream);

        call.on('stream', (remoteStream) => {
            hideWaiting();
            cntrlBtnDone.textContent = 'Spin';
            remoteVideo.srcObject = remoteStream;
            base.style.transform = 'rotate(180deg)';

        });

        var conn = peer.connect(roomCodeGlobal);
        DataConnection = conn;

        conn.on('open', function () {

            conn.on('data', function (data) {
                if (data.type === "message") {
                    const receivedMessage = data.message;
                    createMessageBubble(receivedMessage, false)
                } else if (data.type === "angle") {
                    const recievedAngle = data.angle;
                    const receivedDuration = data.duration;
                    spinBottle(recievedAngle, receivedDuration);
                    cntrlBtnDone.textContent = '👀';
                    setTimeout(() => {
                        cntrlBtnDone.textContent = 'Spin';
                    }, 30000)
                } else if (data.type === "left") {
                    Toast('Stranger left');
                    countdownAndSkip();
                }
            });
        });
    });

});

socket.on("roomNotFound", (participants) => {
    hideWaiting();
    hideLoading();
    Toast("Room Code does not exist");
    countdownAndSkip();
    
});


//? below is random

socket.on("matchedCall", (data) => {
    peer = new Peer();




    peer.on("open", (id) => {
        console.log("Peer ID:", id);
        const call = peer.call(data.roomId, myStream);

        call.on('stream', (remoteStream) => {
            // hideLoading();
            hideWaiting();
            cntrlBtnDone.textContent = 'Spin';
            remoteVideo.srcObject = remoteStream;
            base.style.transform = 'rotate(180deg)';

        });

        var conn = peer.connect(data.roomId);
        DataConnection = conn;

        conn.on('open', function () {

            conn.on('data', function (data) {
                if (data.type === "message") {
                    const receivedMessage = data.message;
                    createMessageBubble(receivedMessage, false)
                } else if (data.type === "angle") {
                    const recievedAngle = data.angle;
                    const receivedDuration = data.duration;
                    spinBottle(recievedAngle, receivedDuration);
                    cntrlBtnDone.textContent = '👀';
                    setTimeout(() => {
                        cntrlBtnDone.textContent = 'Spin';
                    }, 30000)
                } else if (data.type === "left") {
                    Toast('Stranger left');
                    countdownAndSkip();
                }
            });



        });



    });


});



socket.on('matchedAnswer', (data) => {
    console.log('Matched Answer:', data);
    // peer.id = data.roomId;
    peer = new Peer(data.roomId);

    console.log("Peer ID:---", peer.id);




    peer.on('call', call => {

        call.answer(myStream);

        call.on('stream', remoteStream => {
           // hideLoading();
           hideWaiting();

            remoteVideo.srcObject = remoteStream;
        });
    })


    peer.on('connection', function (conn) {
        DataConnection = conn;

        conn.on('open', function () {
            console.log("its working");

            conn.on('data', function (data) {
                if (data.type === "message") {
                    const receivedMessage = data.message;
                    createMessageBubble(receivedMessage, false)
                } else if (data.type === "angle") {
                    const recievedAngle = data.angle;
                    const receivedDuration = data.duration;
                    spinBottle(recievedAngle, receivedDuration);
                    cntrlBtnDone.textContent = '👀';
                    setTimeout(() => {
                        cntrlBtnDone.textContent = 'Spin';
                    }, 30000)


                } else if (data.type === "left") {
                    Toast('Stranger left');
                    countdownAndSkip();
                }

            });




        });

        //peer.on user left

    });


});



window.addEventListener("beforeunload", () => {
    socket.disconnect();
});

// ? for ui related / functioning

msgBtn.addEventListener("click", () => {
    sendMessage();
});

// Function to create and add a message bubble
function createMessageBubble(message, isUser = true) {
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = `message-bubble ${isUser ? "user" : "stranger"}`;
    bubbleDiv.textContent = message;


    const chatMessages = document.querySelector(".chat-messages");
    chatMessages.appendChild(bubbleDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message
function sendMessage() {
    const inputElement = document.getElementById("chat-input");
    const message = inputElement.value.trim();

    if (message) {
        createMessageBubble(message);
        // createMessageBubble(message,false); this is for socket on part when message is recieved
        inputElement.value = "";
        DataConnection.send({ type: "message", message: message });
    }
}

// ?stream
async function startCamera() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localVideo.srcObject = myStream;

        console.log("Camera stream started and stored in globalStream");
    } catch (error) {
        console.error("Error accessing camera and microphone:", error);
        alert(
            "Unable to access camera and microphone. Please ensure you have given the necessary permissions." +
            error
        );
    }
}

function stopCamera() {
    if (myStream) {
        globalStream.getTracks().forEach((track) => track.stop());
        globalStream = null;
        console.log("Camera stream stopped");
    }
}

function toggleAudioMute() {
    if (myStream) {
        const audioTrack = myStream.getAudioTracks()[0];
        if (audioTrack) {
            isAudioMuted = !isAudioMuted;
            audioTrack.enabled = !isAudioMuted;
            console.log(`Audio ${isAudioMuted ? "muted" : "unmuted"}`);
            return isAudioMuted;
        }
    }
    console.error("No audio track found");
    return false;
}

function toggleVideoMute() {
    if (myStream) {
        const videoTrack = myStream.getVideoTracks()[0];
        if (videoTrack) {
            isVideoMuted = !isVideoMuted;
            videoTrack.enabled = !isVideoMuted;
            console.log(`Video ${isVideoMuted ? "muted" : "unmuted"}`);
            return isVideoMuted;
        }
    }
    console.error("No video track found");
    return false;
}

micBtn.addEventListener("click", () => {
    const isMuted = toggleAudioMute();
    if (micBtn.src.includes("assets/mic-on.svg")) {
        micBtn.src = "assets/mic-off.svg";
        micBtn.alt = "Microphone Off";
    } else {
        micBtn.src = "assets/mic-on.svg";
        micBtn.alt = "Microphone On";
    }

});

camBtn.addEventListener("click", () => {
    const isMuted = toggleVideoMute();
    // Update button text or icon based on mute state
    if (camBtn.src.includes("assets/cam-on.svg")) {
        camBtn.src = "assets/cam-off.svg";
        camBtn.alt = "Camera Off";
    } else {
        camBtn.src = "assets/cam-on.svg";
        camBtn.alt = "Camera On";
    }
});

cntrlBtnSkip.addEventListener("click", () => {
    window.location.href = currentUrl;
});
headline.addEventListener("click", () => {
    window.location.href = '/';
});

cntrlBtnDone.addEventListener("click", () => {

    if (cntrlBtnDone.textContent == 'Wait') {
        console.log("hehe, it's not your turn");
    } else {
        //genrate angle
        const angle = getRandomSpinAngle();
        const duration = getRandomSpinDuration();
        //call spin 
        spinBottle(angle, duration);
        //send angle
        DataConnection.send({ type: "angle", angle: angle, duration: duration });
        //make button text 👀
        cntrlBtnDone.textContent = '👀';
        setTimeout(() => {
            cntrlBtnDone.textContent = 'Wait';
        }, 30000)
    }

});
let anglestart = 0;
function getRandomSpinAngle() {
    const minSpins = 60;
    const maxSpins = 120;

    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const randomOffset = Math.floor(Math.random() * 360);

    const angle = (spins * 360) + randomOffset;
    anglestart += angle;
    if (anglestart > 100000) {
        anglestart = 0;
        getRandomSpinAngle();
    }

    return anglestart;
}

function getRandomSpinDuration() {
    const minDuration = 15; // in seconds
    const maxDuration = 30; // in seconds

    const duration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

    return duration;
}

function spinBottle(angle, duration) {
    bottle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    bottle.style.transition = `transform ${duration}s ease-out`;
}

function showLoading() {
    loadingContainer.style.display = 'flex';
}

function hideLoading() {
    loadingContainer.style.display = 'none';
}

function showWaiting() {
    WaitContainer.style.display = 'flex';
}

function hideWaiting() {
    WaitContainer.style.display = 'none';
}


function Toast(message) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'warning',
        title: message,
        customClass: {
            popup: 'swal-toast-jolty'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}
function ToastLong(message) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 7000,
        timerProgressBar: true,
        icon: 'warning',
        title: message,
        customClass: {
            popup: 'swal-toast-jolty'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}


window.onbeforeunload = () => {
    DataConnection.send({ type: "left" });
};

function countdownAndSkip() {
    const cntrlBtnSkip = document.getElementById("skip");

    let count = 3;
    const countdownInterval = setInterval(() => {
        cntrlBtnSkip.innerText = count;
        count--;

        if (count < 1) {
            clearInterval(countdownInterval);
            cntrlBtnSkip.click();
        }
    }, 1000);
}

function showRoomCode(roomcodeText) {
    // <div class="chat-header" style="color: aquamarine; font-size: 18px;" id="roomcode">Room Code:</div>
    const roomCodeEl = document.createElement("div");
    roomCodeEl.className = `chat-header`;
    roomCodeEl.style = `color: black; font-size: 20px; height:25px;font-weight: 400;`
    roomCodeEl.textContent = `Room Code: ${roomcodeText}`;

    roomCodeDiv.appendChild(roomCodeEl);

}

function skiptoend(){
    cntrlBtnSkip.innerText = 'End';
    //change functioning
    currentUrl = '/';

}
