import {segment} from "./segment.mjs";
import {addTransparency} from "./transparency.mjs";


async function main(){

    const videoElement = document.querySelector('video#gum_video');
    const greenScreenCanvas = document.querySelector('canvas#green_screen_canvas');
    const transparentCanvas = document.querySelector('canvas#transparent_canvas');

    // create a stream and send it to replace when its starts playing
    videoElement.onplaying = async ()=> {
        await segment(videoElement, greenScreenCanvas);
        addTransparency(greenScreenCanvas, transparentCanvas);
    };


    let inputStream = await navigator.mediaDevices.getUserMedia( {video: true});
    videoElement.srcObject = inputStream;

}

main().catch(err=>console.error(err));

