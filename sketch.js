let model, webcam, maxPredictions;
//let URL = "https://teachablemachine.withgoogle.com/models/CT5qN9UPL/";
let URL = "https://teachablemachine.withgoogle.com/models/JV39ypejZ/";
let bgColor = [0, 0, 0, 100]; // Reduced opacity to minimize interference
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
    createCanvas(400, 400);
    background(0);

    webcam = createCapture(VIDEO);
    webcam.size(400, 400);
    webcam.hide();

    webcam.elt.onloadeddata = () => {
        console.log("Webcam is ready ✅");
        webcamReady = true;
        predictLoop();
    };
}

function draw() {
    if (webcamReady) {
        image(webcam, 0, 0, width, height);
    }

    // 🔥 Draw keypoints & skeleton BEFORE overlay to avoid interference
    if (currentPose) {
        drawPose(currentPose);
    }

    // 🔥 Overlay semi-transparent background AFTER drawing keypoints
    // Comment this out to check if overlay is affecting detection
   fill(bgColor[0], bgColor[1], bgColor[2], bgColor[3], bgColor[4]);
   rect(0, 0, width, height);

    // Display prediction text
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(predictedClass + " (" + (predictedProb * 100).toFixed(1) + "%)", width / 2, height - 30);
}

async function predictLoop() {
    while (true) {
        if (model && webcamReady) {
            await predict();
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Limit FPS
    }
}

async function predict() {
    if (!webcam || !webcamReady || !model) return;

    const { pose, posenetOutput } = await model.estimatePose(webcam.elt);
    currentPose = pose; // Store keypoints for drawing
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

            // Assign overlay colors based on detected pose
            if (label === "oh") bgColor = [0, 191, 255, 180]; // Electric Blue
            else if (label === "dey") bgColor = [255, 0, 255, 180]; // Pink
            else if (label === "shoki") bgColor = [50, 205, 50, 180]; // Lime Green
            else if (label === "haa") bgColor = [255, 140, 0, 180]; // Bright Orange
            else bgColor = [200, 200, 200, 100]; // Default gray
        }
    }

    predictedClass = bestClass;
    predictedProb = highestProb;

    console.log("Best Prediction:", bestClass, highestProb, "Color:", bgColor);
}

// 🔥 Draw pose keypoints & skeleton
function drawPose(pose) {
    if (!pose) return;

    // Keypoints
    fill(255, 0, 0);
    for (let kp of pose.keypoints) {
        if (kp.score > 0.5) { // Draw only high-confidence keypoints
            ellipse(kp.position.x, kp.position.y, 10, 10);
        }
    }

    // Skeleton connections
    stroke(0, 255, 0);
    strokeWeight(2);
    let skeleton = [
        ["leftShoulder", "rightShoulder"],
        ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"],
        ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"],
        ["leftHip", "rightHip"],
        ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"],
        ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]
    ];

    for (let [p1, p2] of skeleton) {
        let kp1 = pose.keypoints.find(kp => kp.part === p1);
        let kp2 = pose.keypoints.find(kp => kp.part === p2);

        if (kp1 && kp2 && kp1.score > 0.5 && kp2.score > 0.5) {
            line(kp1.position.x, kp1.position.y, kp2.position.x, kp2.position.y);
        }
    }
}
