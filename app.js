let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
let fileInput = document.getElementById('fileInput');
let peerIdInput = document.getElementById('peerId');
let statusSpan = document.getElementById('status');

function connectToPeer() {
    statusSpan.textContent = 'Connecting...';

    localConnection = new RTCPeerConnection();
    remoteConnection = new RTCPeerConnection();

    // Set up the send and receive data channels
    sendChannel = localConnection.createDataChannel('sendChannel');
    sendChannel.onopen = () => console.log('Data channel open');
    sendChannel.onclose = () => console.log('Data channel closed');
    
    remoteConnection.ondatachannel = event => {
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleFile;
        receiveChannel.onopen = () => console.log('Data channel opened');
        receiveChannel.onclose = () => console.log('Data channel closed');
    };

    // Handle ICE candidates to establish the connection
    localConnection.onicecandidate = event => {
        if (event.candidate) {
            remoteConnection.addIceCandidate(event.candidate);
        }
    };

    remoteConnection.onicecandidate = event => {
        if (event.candidate) {
            localConnection.addIceCandidate(event.candidate);
        }
    };

    // Create an offer and start the connection process
    localConnection.createOffer().then(offer => {
        return localConnection.setLocalDescription(offer);
    }).then(() => {
        return remoteConnection.setRemoteDescription(localConnection.localDescription);
    }).then(() => {
        return remoteConnection.createAnswer();
    }).then(answer => {
        return remoteConnection.setLocalDescription(answer);
    }).then(() => {
        return localConnection.setRemoteDescription(remoteConnection.localDescription);
    }).catch(handleError);

    statusSpan.textContent = 'Connected to Peer';
}

function handleFile(event) {
    const fileBlob = event.data;
    const fileReader = new FileReader();
    
    fileReader.onload = function() {
        const fileContent = fileReader.result;
        console.log('Received file data: ', fileContent);
        alert('File received successfully!');
    };
    
    fileReader.readAsText(fileBlob);
}

function sendFile() {
    if (fileInput.files.length === 0) {
        alert('Please select a file to send.');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function() {
        sendChannel.send(reader.result);
        alert('File sent!');
    };
    
    reader.readAsArrayBuffer(file);
}

function handleError(error) {
    console.error('Error during WebRTC connection:', error);
}
