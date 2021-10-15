import {segment} from "./modules/segment.mjs";
import {addTransparency} from "./modules/transparency.mjs";
import "./modules/receiver.mjs";

const videoElement = document.querySelector('video#gum_video');
const greenScreenCanvas = document.querySelector('canvas#green_screen_canvas');
const transparentCanvas = document.querySelector('canvas#transparent_canvas');

const deviceSelect = document.querySelector('select#devices');
const callBtnGreen = document.querySelector('button#call_green');
const callBtnTransparent = document.querySelector('button#call_transparent');

const qvgaBtn =  document.querySelector('button#qvga');
const vgaBtn =  document.querySelector('button#vga');
const hdBtn =  document.querySelector('button#hd');

const FRAME_RATE = 30;

async function sendVideo(stream){
    callBtnGreen.disabled = true;
    callBtnTransparent.disabled = true;

    const track = stream.getVideoTracks()[0];
    const pc = new RTCPeerConnection();
    pc.addTrack(track, stream);
    window.sendStream = stream;         // for debugging


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
    })

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const toReceiverEvent = new CustomEvent('offer', {detail: offer});
    document.dispatchEvent(toReceiverEvent);

    document.addEventListener('answer', async e => {
        console.debug(e.detail);
        await pc.setRemoteDescription(e.detail);
    });
}

async function getVideo(height=480, width=640){
    console.log(`Getting ${width}x${height} video`);

    document.querySelectorAll('video').forEach(element=>{
        element.height = height;
        element.width = width;
    });

    let stream = videoElement.srcObject;

    // kill any running streams to free resources
    if(stream !== null) {
        stream.getTracks().forEach(track => track.stop());
    }

    let videoSource = videoDevices[deviceSelect.selectedIndex || 0]?.deviceId;

    stream = await navigator.mediaDevices.getUserMedia(
        {video:
                { height: height, width: width, frameRate: FRAME_RATE,
                    deviceId: videoSource ? {exact: videoSource} : undefined}});
    videoElement.srcObject = stream;

    console.log(`Capture camera with device ${stream.getTracks()[0].label}`);
}

async function start(){
    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async ()=> {
        await segment(videoElement, greenScreenCanvas);
        addTransparency(greenScreenCanvas, transparentCanvas);
    };

    await getDevices();
    await getVideo();
    // Note: list of devices may change after first approval.

    callBtnGreen.onclick = ()=> sendVideo(greenScreenCanvas.captureStream(FRAME_RATE));
    callBtnTransparent.onclick = ()=> sendVideo(transparentCanvas.captureStream(FRAME_RATE));
}

let videoDevices = [];
async function getDevices(){
    let devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device=>device.kind==='videoinput');
    console.log("video devices:", videoDevices);
    videoDevices.forEach(device=>{
        const option = document.createElement('option');
        option.text = device.label;
        deviceSelect.appendChild(option);
    });
}


deviceSelect.onchange = getVideo;

qvgaBtn.onclick = ()=>getVideo(240,320);
vgaBtn.onclick = ()=>getVideo(480,640);
hdBtn.onclick = ()=>getVideo(720,1280);


start().catch(err=>console.error(err));
