import {addTransparency} from "./transparency.mjs";

const videoElement = document.querySelector('video#receiver');
const transparentCanvas = document.querySelector('canvas#transparent_receiver');

const gFloorRange= document.querySelector('input#g_floor');
const rbCeilingRange= document.querySelector('input#rb_ceiling');

videoElement.onplaying = async ()=> {
    addTransparency(videoElement, transparentCanvas, gFloorRange, rbCeilingRange);
};

// resize when the source changes
videoElement.onresize = ()=>{
    const ctx = transparentCanvas.getContext('2d');
    ctx.clearRect(0,0, transparentCanvas.width, transparentCanvas.height);
    transparentCanvas.width = videoElement.width;
    transparentCanvas.height = videoElement.height;
};

// Look for an offer event to start the peerConnection and answer
document.addEventListener('offer', async e => {
    console.debug(e.detail);

    const pc = new RTCPeerConnection();

    pc.ontrack = e => {
        console.debug(e);
        const stream = e.streams[0];
        videoElement.srcObject = stream;
        window.receiveStream = stream;
    };

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
