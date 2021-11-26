# Playground for exploring background removal in WebRTC

Background removal in the browser on a video camera image captured with `getUserMedia` and
on that same video sent oover a `RTCPeerConnection`.
[MediaPipe](https://google.github.io/mediapipe/solutions/selfie_segmentation.html) 
is used for segmentation. Then that mask is used with the HTML canvas and various 
methods for adding transparency.

WebRTC's `RTCPeerConnection` does not support the alpha channel, 
so these examples also remove the green background and apply the transparency for display. 

See the [How to make your virtual background transparent in WebRTC](httos://webrtchacks.com/virtual-background-transparency) 
post on webrtcHacks.com for full details and experimental results.

### playground.html

Try it: [playground.html](https://webrtchacks.github.io/transparent-virtual-background/playground.html)

Step by step with many options so you can see the process. Uses the modules folder.


### transparency.html

Try it: [transparency.html](https://webrtchacks.github.io/transparent-virtual-background/transparency.html)

All-in one file that uses WebRTC Insertable Streams ([media capture transform](https://github.com/w3c/mediacapture-transform) / 
break out box). Meant to mimic a WebRTC app where you would send your video with a green screen to
another user and view someone else's incoming video with a transparent background.


## Demo video
[![webrtcHacks Transparent Background Playground demo](https://webrtchacks.com/wp-content/uploads/2021/11/webrtcHacks-Transparency-Playground-demo-small.gif)](https://webrtchacks.com/wp-content/uploads/2021/11/webrtcHacks-Transparency-Playground-demo.mp4)

