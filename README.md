# 1. Bad Apple

This is the repository for my own implementation of Bad Apple (in ASCII) in a web browser, available [here](http://www.vws-bdsmden.fr/badapple/).

Bad Apple!! is a popular song where its music video is only in white and black colors, making it a nice test for devices or systems which supports a minimum of a graphical interface. More info on [Wikipedia](https://en.wikipedia.org/wiki/Bad_Apple!!).

# 2. How to run

You can run this locally if you have **npm** installed, but before that you have to unzip the ascii frames from `public/frames/frames.7z`. Then you can do the following:

```bash
npm i
npm run start
```

Then access the animation on `localhost:3000`.

# 3. Implementation

The project uses react-static to make use of React and bundle the pages easily for a static site. Aside from that, the core code is in `src/pages/index.js`.

## 3.1. Frames

The frames, zipped in the repo, were extracted using an image to ascii module (which there are plenty of on the web). The frames were extracted at a rate of 30 frames per second, resulting in 6562 frames, or .txt files.

The first step to display Bad Apple!! on a web browser is to load the frames to display. The app uses `fetch` to query `/public/frames/bad_apple_{FRAME_NUMBER}`. Since this is supposed to run on client side, we can't use NodeJS's fs module to open files, so the simplest solution I've found is to just query all frames through internet (that means if any other website would expose the frames, this app could just serve as a player that searches frames from another website).

However loading all 6562 frames might make the viewer wait a little bit too long, so I've decided to load the frames by chunks of 500 frames. Every time the displayed frame reaches the number of loaded frames divided by 2, the app loads another chunk of 500 frames.

## 3.2. Timer

### 3.2.1. Javascript's inaccurate timers
The biggest problem I encountered to have a nice animation on the browser, is to have an accurate timer. Using setTimeout or hooks shenanigans would result in a slowed down or accelerated display of the frames. Due to hardware and how the event loop works, functions like setTimeout or setInterval might fire their callbacks with a bit of a delay.  In normal times, these functions are relatively accurate and enough for the limited animations that regular websites use. However, the accumulation of delays across 6562 frames is quite visible through the animation.

### 3.2.2. Building an accurate timer

By building it, I mean shamelessly copy paste the code from [this article](https://www.sitepoint.com/creating-accurate-timers-in-javascript/). The solution to correct delays is to compute that delay every time we need to repeat a function call (i.e. a drawing function), then substract that delay from the initial timeout.

For example, imagine a video where its speed is 1 FPS (one frame is displayed each second). If we're currently displaying frame 9 at 9.5s (the extra 0.5s comes from the setTimeout delay) of the video, and frame 10 is supposed to be displayed at 10s, then we need to subtract the delay from the speed, i.e. 1 - 0.5 = 0.5, and use this as the timeout for the next setTimeout call: `setTimeout(drawFrame, 5000)`.

### End result
This results in a rather simple code, where the main logic consists of only fetching the frames and drawing at the right time. The use of React is absolutely not necessary and could be written in plain Javascript.
