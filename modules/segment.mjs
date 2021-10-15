let ctx, height, width;

function greenScreen(results) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.segmentationMask, 0, 0,
        width, height);

    // Only overwrite existing pixels.
    ctx.globalCompositeOperation = 'source-out'; // 'source-in';
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, width, height);

    // Only overwrite missing pixels.
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(
        results.image, 0, 0, width, height);

    ctx.restore();
}

export async function segment(inputVideo, outputCanvas){
    height = inputVideo.videoHeight;
    width = inputVideo.videoWidth;

    outputCanvas.height = height;
    outputCanvas.width = width;

    ctx = outputCanvas.getContext('2d');

    const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }});
    selfieSegmentation.setOptions({
        modelSelection: 1,
    });

    await selfieSegmentation.onResults(greenScreen);

    async function draw(){
        await selfieSegmentation.send({image: inputVideo});
        inputVideo.requestVideoFrameCallback(draw);
    }

    // ToDo: this method doesn't work in FF or Safari
    inputVideo.requestVideoFrameCallback(draw);
}

