let stats = new Stats();
stats.dom.style.position = 'absolute';
stats.dom.style.left = '';
stats.dom.style.right = '0px';

document.body.appendChild(stats.dom);

function update(){
    stats.update();
    requestAnimationFrame(update)
}

requestAnimationFrame(update);
