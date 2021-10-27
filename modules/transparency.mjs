function addAlpha(imageData, gFloor=105, rbCeiling=80) {
    const {data} = imageData;

    for (let r = 0, g = 1, b = 2, a = 3; a < data.length; r += 4, g += 4, b += 4, a += 4) {
        if (data[r] <= rbCeiling && data[b] <= rbCeiling && data[g] >= gFloor)
            data[a] = 0;
    }
    return imageData
}

// ToDo: make this a class
export function addTransparency(source, outputCanvas, gFloorElem, rbCeilingElem) {
    const outputCtx = outputCanvas.getContext('2d');

    outputCanvas.height = source.height;
    outputCanvas.width = source.width;

    const getImageData = () => {
        const width = source.width;
        const height = source.height;

        outputCtx.drawImage(source, 0, 0, width, height);
        const imageData = outputCtx.getImageData(0, 0, width, height);
        const transparentImageData = addAlpha(imageData, gFloorElem.value, rbCeilingElem.value);
        outputCtx.putImageData(transparentImageData, 0, 0);

        requestAnimationFrame(getImageData);
    };

    getImageData();
}

