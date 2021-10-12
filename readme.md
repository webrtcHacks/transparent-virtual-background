# Notes

Background removal using MediaPipe Selfie and canvas to add transparency. 
MediaPipe is used for segmentation. Then that mask is used to apply a green background.
The transparency function then sets the alpha channel on green to 100 so it is transparent.

WebRTC does not support the alpha channel, so you need to send a green background and apply the transparency after that.

### index.html

Step by step so you can see the process. Uses the modules folder.

There is also a _stats_ branch where I attempted to use https://github.com/mrdoob/stats.js to show FPS as a performance monitor. 
That's a work in progress I didn't finish.


### transparent_bob.html

All-in one file that uses WebRTC Insertable Streams ([media capture transform](https://github.com/w3c/mediacapture-transform) / 
break out box / why so many names???). 

Added camera device selection to quickly see how different camera angles perform.


## Findings
* In index.html, the peerConnection seems to convert the RGBA to RBG by blending the Alpha into Green.
* As shown in index.html, the above still works on the receiver end if you set your green tolerance large enough
* When I tried the same with breakout box it set the background to black
* The breakout box example uses more CPU than the step-by-step one - I was expecting it to use less. 
Did I did something wrong?


## ToDo
* FPS stats to show performance?
* Use a worker for the transparent_bob.html example
* Hookup resolution buttons in the all-in-one example or remove them
* Manage resource clean-up when switching cameras / resolutions? 
* browser support warnings
* Use WebGL instead of canvas - see: https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/; 
would that lower CPU? That algorithm looks better (used by OBS)
* In the all-in-one, use a `<video>` element instead of a canvas to show the selfie-view - in a real app a video 
element would be used until transparency is turned on and reusing this element is probably more realistic. 
Would adding a 2nd generator start another encoding that would suck up more CPU?
* github.io pages
