//const canvas = new OffscreenCanvas(1, 1);
const canvas = document.querySelector('canvas#output_canvas');
//const ctx = canvas.getContext('2d', {desynchronized: true});
const ctx = canvas.getContext('2d');

//canvas.height = 720;
//canvas.width = 1280;

function onResults(results) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.segmentationMask, 0, 0,
        canvas.width, canvas.height);

    // Only overwrite existing pixels.
    ctx.globalCompositeOperation = 'source-out'; // 'source-in';
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only overwrite missing pixels.
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(
        results.image, 0, 0, canvas.width, canvas.height);

    ctx.restore();
}


export async function segment(videoElement){
    const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }});
    selfieSegmentation.setOptions({
        modelSelection: 1,
    });


    await selfieSegmentation.onResults(onResults);


    async function draw(){
        await selfieSegmentation.send({image: videoElement});
        videoElement.requestVideoFrameCallback(draw);
    }

    // ToDo: this method doesn't work in FF or Safari
    videoElement.requestVideoFrameCallback(draw);


    //const generator = new MediaStreamTrackGenerator({kind: video});
    //const processor = new MediaStreamTrackProcessor({input})


}

