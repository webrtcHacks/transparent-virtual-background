function addAplha(imageData) {

    let data = imageData.data;
    const gFloor = 105;         // consider any green above this value to be transparent
    const rbCeiling = 80;       // highest value for red and blue to be considered transparent

    for (let r = 0, g = 1, b = 2, a = 3; a < data.length; r += 4, g += 4, b += 4, a += 4) {
        if (data[r] <= rbCeiling && data[b] <= rbCeiling && data[g] >= gFloor)
            data[a] = 0;
    }

    return imageData

}


// let offscreen = new OffscreenCanvas(height, width);
// const hiddenCtx = offscreen.getContext("2d");


export function addTransparency(source, outputCanvas) {

    let height, width;

    let outputCtx = outputCanvas.getContext("2d");


    function getImageData() {

        outputCtx.drawImage(source, 0, 0);
        let imageData = outputCtx.getImageData(0, 0, width, height);
        const transparentImageData = addAplha(imageData, width, height);
        outputCtx.putImageData(transparentImageData, 0, 0);

        requestAnimationFrame(getImageData);
    }

    // Let the function work with a video or canvas element
    if (source.tagName === 'VIDEO') {
        let sourceStream = source.srcObject;
        let streamSettings = sourceStream.getVideoTracks()[0].getSettings();
        console.log("video stream settings:", streamSettings);

        height = streamSettings.height;
        width = streamSettings.width;
    } else if (source.tagName === 'CANVAS') {
        height = source.height;
        width = source.width;
    } else {
        console.error("Invalid source element");
        return
    }

    outputCanvas.height = height;
    outputCanvas.width = width;

    getImageData();


}
