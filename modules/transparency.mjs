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

export function addTransparency(source, outputCanvas) {


    let outputCtx = outputCanvas.getContext("2d");

    outputCanvas.height = source.height;
    outputCanvas.width = source.width;

    function getImageData() {

        let height = outputCanvas.height;
        let width = outputCanvas.width;

        outputCtx.drawImage(source, 0, 0, width, height);
        let imageData = outputCtx.getImageData(0, 0, width, height);
        const transparentImageData = addAplha(imageData, width, height);
        outputCtx.putImageData(transparentImageData, 0, 0);

        requestAnimationFrame(getImageData);
    }

    getImageData();


}
