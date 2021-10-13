import {addTransparency} from "./transparency.mjs";

const videoElement = document.querySelector('video#receiver');
const transparentCanvas = document.querySelector('canvas#transparent_receiver');

videoElement.onplaying = async ()=> {
    addTransparency(videoElement, transparentCanvas);
};


document.addEventListener('offer', async e => {
    console.debug(e.detail);

    const pc = new RTCPeerConnection();

    pc.ontrack = e => {
        console.debug(e);
        const stream = e.streams[0]; // || null;
        videoElement.srcObject = stream;
        window.receiveStream = stream;
    };

    // pc.onicecandidateerror = err => console.error(err);
    // pc.onconnectionstatechange = e => console.debug(e);
    // pc.oniceconnectionstatechange = e => console.debug(e);

    pc.onicecandidate = candidate => {
        const toReceiverEvent = new CustomEvent('candidate', {detail: candidate});
        document.dispatchEvent(toReceiverEvent);
    };

    document.addEventListener('candidate', async e => {
        console.debug(e.detail);
        await pc.addIceCandidate(e.detail.candidate);
    });


    await pc.setRemoteDescription(e.detail);

    window.receiverPc = pc;

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const toSenderEvent = new CustomEvent('answer', {detail: answer});
    document.dispatchEvent(toSenderEvent);
});
