import {segment} from "./segment.mjs";
import {addTransparency} from "./transparency.mjs";


async function main(){

    const videoElement = document.querySelector('video#gum_video');
    const greenScreenCanvas = document.querySelector('canvas#green_screen_canvas');
    const transparentCanvas = document.querySelector('canvas#transparent_canvas');

    const deviceSelect = document.querySelector('select#devices');

    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async ()=> {
        await segment(videoElement, greenScreenCanvas);
        addTransparency(greenScreenCanvas, transparentCanvas);
    };


    async function getVideo(){
        let stream = videoElement.srcObject;
        if(stream !== null) {
            stream.getTracks().forEach(track => track.stop());
        }

        let videoSource = videoDevices[deviceSelect.selectedIndex || 0]?.deviceId;

        stream = await navigator.mediaDevices.getUserMedia(
            {video:
                        {deviceId: videoSource ? {exact: videoSource} : undefined}});
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


}

main().catch(err=>console.error(err));

