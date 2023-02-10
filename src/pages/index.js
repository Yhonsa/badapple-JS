import React, { useEffect, useRef, useState } from "react";
const NB_FRAMES = 6562;
const NB_FRAMES_TO_LOAD_EACH_CHUNK = 30;
const FPS = 30;
const MS = 1000;

const padNumber = (n) =>
	n.toLocaleString("en-US", { minimumIntegerDigits: 3, useGrouping: false });

const fetchOneFrame = async (n) => {
	let frame = await fetch(`./frames/bad_apple_${padNumber(n)}.txt`);
	frame = await frame.text();
	return frame;
};
const fetchFrames = async () => {
	const allFrames = [];
	for (let i = 1; i <= NB_FRAMES; i++) {
		let frame = fetchOneFrame(i);
		allFrames.push(frame);
	}
	return await Promise.all(allFrames);
};

const fetchChunkFrames = async (frameToLoad, number) => {
	const frames = [];
	for (
		let i = 1;
		i + frameToLoad <= NB_FRAMES && i <= number;
		i++
	) {
		let frame = fetchOneFrame(i + frameToLoad);
		frames.push(frame);
	}
	return await Promise.all(frames);
};
let allFrames = [];
let framesLoaded = 0;
let loading = false;

/**
 * Function to have an accurate timer that will trigger a function oninstance in the right time. 
 * Needed because native timers in Javascript are not accurate enough because of CPU lag and the way the event loop works, thus provoking an acceleration
 * or a slowed down animation when using setTimeout or setInterval alone.
 * doTimer function by James Edwards, June 23, 2010
 * https://www.sitepoint.com/creating-accurate-timers-in-javascript/
 */
const doTimer = (length, resolution, oninstance, oncomplete) => {
	const steps = (length / 100) * (resolution / 10),
		speed = length / steps,
		start = new Date().getTime();
	let count = 0;

	const instance = () => {
		if (count++ == steps) {
			oncomplete(steps, count);
		} else {
			oninstance(steps, count);
			let diff = new Date().getTime() - start - count * speed;
			window.setTimeout(instance, speed - diff);
		}
	};

	window.setTimeout(instance, speed);
};

const BadApple = () => {
	const [darkMode, setDarkMode] = useState(false);
	const [display, setDisplay] = useState("Loading frames...");
	const [clicked, setClicked] = useState(false);
	const codeId = useRef(null);

	const drawFrame = (steps, count) => {
		codeId.current.textContent = allFrames[count];
		// If only half ot the frames are remaining, load the next frames
		if (count >= framesLoaded / 2 && !loading) {
			loadRemainingFrames(NB_FRAMES_TO_LOAD_EACH_CHUNK);
		}
	};

	const play = () => {
		const audio = new Audio("./bad_apple.mp3");
		audio.volume = 0.3;
		audio.play();

		doTimer(NB_FRAMES * MS / FPS, FPS, drawFrame, (steps, count) => {
			setDisplay(<StartButton />);
		});
		setDisplay(
			<button
				onClick={() => {
					setDarkMode((prevDarkMode) => !prevDarkMode);
				}}
				style={{ marginBottom: "8px" }}
			>
				Dark mode
			</button>
		);

	};
	const StartButton = () => {
		return (
			<button
				onClick={() => {
					if (!clicked) {
						setClicked(true);
						play();
						setClicked(false);
					}
				}}
			>
				<audio src="./bad_apple.mp3" id="audio"></audio>
				Start weebing 🔊
			</button>
		);
	};

	const loadRemainingFrames = async (number) => {
		loading = true;
		const newFrames = await fetchChunkFrames(framesLoaded, number);
		allFrames = allFrames.concat(newFrames);
		framesLoaded = framesLoaded + number;
		loading = false;
	};

	// Load frames at start
	useEffect(() => {
		(async () => {
			// Fetch frames
			await loadRemainingFrames(500);
			setDisplay(<StartButton />);
		})();
	}, []);

	// Switch dark mode
	useEffect(() => {
		document.body.style.backgroundColor = darkMode ? "black" : "white";
		codeId.current.style.color = darkMode ? "white" : "black";
	}, [darkMode]);

	return (
		<>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{display}
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "center",
					marginLeft:"4px",
					marginRight:"4px"
				}}
			>
				<code
					style={{
						whiteSpace: "pre",
						position: "absolute",
						fontSize: "1.59vmin",
						lineHeight: "1.59vmin",
						fontFamily: "monospace",
					}}
					id="display"
					ref={codeId}
				/>
			</div>
		</>
	);
};

export default BadApple;
