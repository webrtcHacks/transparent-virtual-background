import {segment} from "./modules/segment.mjs";
import {addTransparency} from "./modules/transparency.mjs";
import "./modules/receiver.mjs";

const videoElement = document.querySelector('video#gum_video');
const greenScreenCanvas = document.querySelector('canvas#green_screen_canvas');
const transparentCanvas = document.querySelector('canvas#transparent_canvas');

const deviceSelect = document.querySelector('select#devices');
const callBtnGreen = document.querySelector('button#call_green');
const callBtnTransparent = document.querySelector('button#call_transparent');

const FRAME_RATE = 30;

async function sendVideo(stream){

    callBtnGreen.disabled = true;
    callBtnTransparent.disabled = true;

    let track = stream.getVideoTracks()[0];
    let settings = track.getSettings();
    console.log(settings);

    let pc = new RTCPeerConnection();
    pc.addTrack(track, stream);
    window.sendStream = stream;


    // pc.onicecandidateerror = err => console.error(err);
    // pc.onconnectionstatechange = e => console.debug(e);
    // pc.oniceconnectionstatechange = e => console.debug(e);


    pc.onicecandidate = candidate => {
        const toReceiverEvent = new CustomEvent('candidate', {detail: candidate});
        document.dispatchEvent(toReceiverEvent);
    };

    /*
    document.addEventListener('candidate', async e => {
        console.debug(e.detail);
        await pc.addIceCandidate(e.detail.candidate);
    })
     */


    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    let message = pc.localDescription;
    const toReceiverEvent = new CustomEvent('offer', {detail: message});
    document.dispatchEvent(toReceiverEvent);


    document.addEventListener('answer', async e => {
        console.debug(e.detail);
        await pc.setRemoteDescription(e.detail);
    });


    }

async function main(){


    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async ()=> {
        await segment(videoElement, greenScreenCanvas);
        addTransparency(greenScreenCanvas, transparentCanvas);
    };


    async function getVideo(){
        let stream = videoElement.srcObject;

        // kill any running streams to free resources
        if(stream !== null) {
            stream.getTracks().forEach(track => track.stop());
        }

        let videoSource = videoDevices[deviceSelect.selectedIndex || 0]?.deviceId;

        stream = await navigator.mediaDevices.getUserMedia(
            {video:
                        { height: 240, frameRate: FRAME_RATE,
                            deviceId: videoSource ? {exact: videoSource} : undefined}});
        videoElement.srcObject = stream;

        console.log(`Capture camera with device ${videoDevices[deviceSelect.selectedIndex || 0]?.label}`);
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

    await getVideo();
    await getDevices();

    callBtnGreen.onclick = ()=> sendVideo(greenScreenCanvas.captureStream(FRAME_RATE));

    // Show this doesn't work
    callBtnTransparent.onclick = ()=> sendVideo(transparentCanvas.captureStream(FRAME_RATE));


}

main().catch(err=>console.error(err));
