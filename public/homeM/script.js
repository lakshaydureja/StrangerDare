const socket = io();


document.getElementById('btn1').addEventListener('click', function() {
    // socket.emit('random');
    window.location.href = '/playzoneRandom';

});


// Store the socket ID in sessionStorage
socket.on('connect', () => {
    console.log('Connected with socket ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
});
// Handle other socket events here

// Clean up socket connection on page unload
window.addEventListener('beforeunload', () => {
    socket.disconnect();
});





const headline = document.getElementById('headline');
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const buttonContainer = document.querySelector('.buttons');

btn2.addEventListener('click', function() {
        headline.textContent = 'Create a room or join one';
        buttonContainer.innerHTML = `
        <button class="btn random" onclick="createOnclick()">Create</button>
        <button class="btn friends" onclick="joinOnclick()">Join</button>
    `;
});


function createOnclick(){
    window.location.href = '/createRoom';
}

function joinOnclick(){
    headline.textContent = 'Write your room code';
    buttonContainer.innerHTML = `
        <input type="text" id="roomCodeInput" placeholder="Enter Room Code">
        <button id="submitButton" class="btn friends-btn" onclick="submitCode()" >Submit</button>
    `;
}

function submitCode(){
    console.log("clicked");
    const roomCode = document.getElementById('roomCodeInput').value;
    window.location.href = `/joinroom?roomCode=${roomCode}`;
}

