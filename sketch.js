let model, webcam, maxPredictions;
let URL = "https://teachablemachine.withgoogle.com/models/JV39ypejZ/";
let bgColor = [0, 0, 0, 100]; // Reduced opacity
let predictedClass = "Waiting...";
let predictedProb = 0;
let webcamReady = false;
let currentPose = null; // Stores pose keypoints for visualization

async function initModel() {
    console.log("Loading Model...");
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model Loaded ✅");

    setupWebcam();
}

async function setupWebcam() {
    let canvas = createCanvas(800, 400).parent("canvas-container"); // Attach to container
    background(0);

    webcam = createCapture(VIDEO);
    webcam.size(400, 400);
    webcam.hide(); // Hide default HTML element

    // Force webcam to play continuously
    webcam.elt.setAttribute("playsinline", "true"); // Mobile compatibility
    webcam.elt.play();

    // 🛠️ Fix: Force video restart if it freezes
    webcam.elt.onpause = () => {
        console.warn("Webcam paused! Restarting...");
        webcam.elt.play();
    };

    // Wait until webcam is fully loaded before running predictions
    webcam.elt.onloadeddata = () => {
        console.log("Webcam is ready ✅");
        webcamReady = true;
        predictLoop(); // Start correct function
    };
}

function draw() {
    background(0);

    if (webcamReady) {
        webcam.elt.play(); // 🔥 Ensure webcam stays active
        image(webcam, 0, 0, 400, 400); // 🔥 Fix: Ensures continuous frame updates

        // Draw keypoints & skeleton if a pose is detected
        if (currentPose?.keypoints?.length > 0) {
            drawPose(currentPose);
        }

        // Display prediction text
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text(predictedClass + " (" + (predictedProb * 100).toFixed(1) + "%)", 200, 370);
    } else {
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Waiting for Webcam...", 200, 200);
    }

    // Background color update and draw on right side
    fill(color(bgColor[0], bgColor[1], bgColor[2], bgColor[3]));
    rect(400, 0, 400, 400);
}

function drawPose(pose) {
    if (!pose || !pose.keypoints || !Array.isArray(pose.keypoints)) {
        console.warn("Skipping drawPose: Pose data is undefined or invalid."); // Debugging
        return;
    }

    stroke(0, 255, 0);
    strokeWeight(2);
    for (let i = 0; i < pose.keypoints.length; i++) {
        let keypoint = pose.keypoints[i];
        if (keypoint?.score > 0.2) { // 🔥 Fix: Ensure keypoint exists
            fill(255, 0, 0);
            noStroke();
            ellipse(keypoint.position.x, keypoint.position.y, 8, 8);
        }
    }

    // 🔥 Fix: Ensure `pose.skeleton` exists before accessing it
    if (!pose.skeleton || !Array.isArray(pose.skeleton)) {
        console.warn("Skipping drawPose: Skeleton data is missing.");
        return;
    }

    // Draw skeleton connections
    stroke(0, 255, 255);
    strokeWeight(2);
    for (let i = 0; i < pose.skeleton.length; i++) {
        let partA = pose.skeleton[i][0]?.position;
        let partB = pose.skeleton[i][1]?.position;
        if (partA && partB) {
            line(partA.x, partA.y, partB.x, partB.y);
        }
    }
}

function predictLoop() {
    setInterval(async () => {
        if (model && webcamReady) {
            await predict();
        }
    }, 100); // Runs every 100ms (10 FPS)
}

async function predict() {
    if (!webcam || !webcamReady || !model) return;

    const { pose, posenetOutput } = await model.estimatePose(webcam.elt);
    if (!pose || !pose.keypoints) {
        console.warn("Pose estimation returned undefined data."); // Debugging
        return;
    }

    const prediction = await model.predict(posenetOutput);

    let highestProb = 0;
    let bestClass = "Unknown";

    for (let i = 0; i < maxPredictions; i++) {
        let prob = prediction[i].probability;
        let label = prediction[i].className;

        console.log(`Class ${label}: ${prob.toFixed(2)}`);

        if (prob > highestProb) {
            highestProb = prob;
            bestClass = label;
        }
    }

    predictedClass = bestClass || "Waiting..."; // 🔥 FIX: Ensure text updates
    predictedProb = highestProb || 0;
    currentPose = pose; // 🔥 FIX: Store pose data for visualization

    // Assign background colors based on labels
    if (bestClass === "oh") bgColor = [0, 191, 255, 180]; // Electric Blue
    else if (bestClass === "dey") bgColor = [255, 0, 255, 180]; // Pink
    else if (bestClass === "shoki") bgColor = [50, 205, 50, 180]; // Lime Green
    else if (bestClass === "haa") bgColor = [255, 140, 0, 180]; // Bright Orange
    else bgColor = [200, 200, 200, 100]; // Default gray

    console.log("Best Prediction:", bestClass, highestProb, "Color:", bgColor);
}
