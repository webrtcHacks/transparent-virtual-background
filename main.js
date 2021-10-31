import {segment} from "./modules/segment.mjs";
import {addTransparency} from "./modules/transparency.mjs";
import {addShader} from "./modules/wegbl-transparency.mjs";

import "./modules/receiver.mjs";
import './modules/stats.mjs';


const videoElement = document.querySelector('video#gum_video');
const transparentCanvas = document.querySelector('canvas#transparent_canvas');
const greenScreenCanvas = document.querySelector('canvas#green_screen_canvas');
const transparentGreenCanvas = document.querySelector('canvas#transparent_green_canvas');
const webglCanvas = document.querySelector('canvas#transparent_green_webgl');

const deviceSelect = document.querySelector('select#devices');

const callBtnTransparent = document.querySelector('button#call_transparent');
const callBtnGreen = document.querySelector('button#call_green');
const callBtnTransparentCanvas = document.querySelector('button#call_transparent_green');
const callBtnTransparentWebgl = document.querySelector('button#call_transparent_webgl');

const videoEnabled = document.querySelector('input#show_video');
const transparencyEnabled = document.querySelector('input#show_transparency');
const greenScreenEnabled = document.querySelector('input#show_green_screen');
const greenTransparencyEnabled = document.querySelector('input#show_green_transparency');
const webglEnabled = document.querySelector('input#show_webgl_transparency');


const qvgaBtn = document.querySelector('button#qvga');
const vgaBtn = document.querySelector('button#vga');
const hdBtn = document.querySelector('button#hd');

// canvas green screen controls
const gFloorRange = document.querySelector('input#g_floor');
const rbCeilingRange = document.querySelector('input#rb_ceiling');

// webGL controls
const keyColor = document.getElementById("keyColor");
const similarityRange = document.getElementById("similarity");
const smoothnessRange = document.getElementById("smoothness");
const spillRange = document.getElementById("spill");


const FRAME_RATE = 30;

let videoWidth = 640;
let videoHeight = 480;



// Safari & Firefox don't support OffscreenCanvas
const offscreenCanvas = typeof OffscreenCanvas === 'undefined' ? document.createElement("canvas") :
    new OffscreenCanvas(1, 1);
let segmentedCanvas;

async function sendVideo(stream) {

    // Disable controls so we don't need to deal with track change logic
    document.querySelectorAll('.senderControl')
        .forEach(control => control.disabled = true);

    const track = stream.getVideoTracks()[0];
    const pc = new RTCPeerConnection();
    pc.addTrack(track, stream);
    window.sendStream = stream;         // for debugging

    pc.onicecandidate = candidate => {
        const toReceiverEvent = new CustomEvent('candidate', {detail: candidate});
        document.dispatchEvent(toReceiverEvent);
    };

    document.addEventListener('candidate', async e => {
        console.debug(e.detail);
        await pc.addIceCandidate(e.detail.candidate);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const toReceiverEvent = new CustomEvent('offer', {detail: offer});
    document.dispatchEvent(toReceiverEvent);

    document.addEventListener('answer', async e => {
        console.debug(e.detail);
        await pc.setRemoteDescription(e.detail);
    });
}

async function getVideo() {
    console.log(`Getting ${videoWidth}x${videoHeight} video`);

    document.querySelectorAll('video').forEach(element => {
        element.height = videoHeight;
        element.width = videoWidth;
    });

    let videoSource = videoDevices[deviceSelect.selectedIndex || 0]?.deviceId;

    let stream = await navigator.mediaDevices.getUserMedia(
        {
            video:
                {
                    height: {exact: videoHeight}, width: {exact: videoWidth}, frameRate: FRAME_RATE,
                    deviceId: videoSource ? {exact: videoSource} : undefined
                }
        });
    videoElement.srcObject = stream;
    videoElement.play();
    console.log(`Capture camera with device ${stream.getTracks()[0].label}`);
}

async function start() {
    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async () => {

        // use the offscreen canvas when the visible one is hidden for improved performance
        segmentedCanvas = greenScreenEnabled.checked ? greenScreenCanvas : offscreenCanvas;
        segmentedCanvas.height = videoElement.height;
        segmentedCanvas.width = videoElement.width;

        let lastTime = new Date();

        async function getFrames() {
            const now = videoElement.currentTime;
            if (now > lastTime){
                const fps = (1/(now-lastTime)).toFixed();
                await segment(videoElement, transparentCanvas, segmentedCanvas);
            }
            lastTime = now;
            requestAnimationFrame(getFrames)
        }

        await getFrames();

        addTransparency(segmentedCanvas, transparentGreenCanvas, gFloorRange, rbCeilingRange);
        addShader(segmentedCanvas, webglCanvas, keyColor, similarityRange, smoothnessRange, spillRange);

    };

    // Note: list of devices may change after first camera permission approval
    await getDevices();
    await getVideo();

    callBtnGreen.onclick = () => sendVideo(greenScreenCanvas.captureStream(FRAME_RATE));
    callBtnTransparent.onclick = () => sendVideo(transparentGreenCanvas.captureStream(FRAME_RATE));
    callBtnTransparentCanvas.onclick = () => sendVideo(transparentGreenCanvas.captureStream(FRAME_RATE));
    callBtnTransparentWebgl.onclick = () => sendVideo(webglCanvas.captureStream(FRAME_RATE));

}

let videoDevices = [];

async function getDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log("video devices:", videoDevices);
    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.text = device.label;
        deviceSelect.appendChild(option);
    });
}

deviceSelect.onchange = getVideo;

qvgaBtn.onclick = async () => {
    videoWidth = 320;
    videoHeight = 240;
    await getVideo();
};

vgaBtn.onclick = async () => {
    videoWidth = 640;
    videoHeight = 480;
    await getVideo();
};

hdBtn.onclick = async () => {
    videoWidth = 1280;
    videoHeight = 720;
    await getVideo();
};


videoEnabled.onclick = async () => {
    console.log("Changing video display state");
    videoElement.parentElement.hidden = !videoElement.parentElement.hidden;
    await videoElement.play();
};

transparencyEnabled.onclick = async () => {
    console.log("Changing transparency display state");
    transparentCanvas.parentElement.hidden = !transparentCanvas.parentElement.hidden;
    await videoElement.play();
};

greenScreenEnabled.onclick = async () => {
    console.log("Changing green screen display state");
    greenScreenCanvas.parentElement.hidden = !greenScreenCanvas.parentElement.hidden;
    if (greenScreenCanvas.parentElement.hidden)
        await videoElement.play();
};

greenTransparencyEnabled.onclick = async () => {
    console.log("Changing transparent canvas display state");
    transparentGreenCanvas.parentElement.hidden = !transparentGreenCanvas.parentElement.hidden;
    await videoElement.play();
};

webglEnabled.onclick = async () => {
    console.log("Changing WebGL display state");
    webglCanvas.parentElement.hidden = !webglCanvas.parentElement.hidden;
    window.enableWebgl = !window.enableWebgl;
    if (window.enableWebgl) {
        addShader(greenScreenCanvas, webglCanvas, keyColor, similarityRange, smoothnessRange, spillRange);
        await videoElement.play();
    }
};


start().catch(err => console.error(err));
