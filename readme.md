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
* sending the wegGL source over a peerConnection doesn't work at all
* When I tried the same with breakout box it set the background to black



## ToDo
* Use a worker for the transparent_bob.html example
* Manage resource clean-up when switching cameras / resolutions? 
* browser support warnings
* github.io pages
