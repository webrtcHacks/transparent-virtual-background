import {segment} from "./segemt.mjs";

/*
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await selfieSegmentation.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();

*/


async function main(){
    let inputStream = await navigator.mediaDevices.getUserMedia({video: {height: 720, width: 1280}});
    const videoElement = document.querySelector('video#gum_video');
    videoElement.srcObject = inputStream;

    await segment(videoElement);
    //const [inputTrack] = inputStream.getVideoTracks();

}

main().catch(err=>console.error(err));

//document.getElementById('video#segment_video').srcObject = segmentStream;
