let model, webcam, maxPredictions;
let URL = "https://teachablemachine.withgoogle.com/models/QhLCo2482/";
//let bgColor = [0, 0, 0, 100]; // Reduced opacity
let predictedClass = "Waiting...";
let predictedProb = 0;
let webcamReady = false;
let currentPose = null; // Stores pose keypoints for visualization
let particles = [];

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

    // Force video restart if it freezes
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
        webcam.elt.play(); // Ensures webcam stays active
        image(webcam, 0, 0, 400, 400); // Ensures continuous frame updates

        // Draw keypoints & skeleton if a pose is detected
        if (currentPose && currentPose.keypoints?.length > 0) {
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

    updateParticles();
    /*// Background color update and draw on right side
    fill(color(bgColor[0], bgColor[1], bgColor[2], bgColor[3]));
    rect(400, 0, 400, 400); */
}

function drawPose(pose) {
    if (!pose || !pose.keypoints || !Array.isArray(pose.keypoints)) {
        console.warn("Skipping drawPose: Pose data is undefined or invalid.");
        return;
    }

    // 🔥 Draw keypoints (Red circles)
    stroke(0, 255, 0);
    strokeWeight(2);
    for (let i = 0; i < pose.keypoints.length; i++) {
        let keypoint = pose.keypoints[i];
        if (keypoint?.score > 0.2 && keypoint.position?.x && keypoint.position?.y) { // 🔥 Ensure keypoint has valid position
            fill(255, 0, 0);
            noStroke();
            ellipse(keypoint.position.x, keypoint.position.y, 8, 8);
        }
    }

    // 🔥 Define Skeleton Structure (Ensure all valid keypoints)
    let skeleton = [
        ["leftShoulder", "rightShoulder"],
        ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"],
        ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"],
        ["leftHip", "rightHip"],
        ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"],
        ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]
    ];

    // 🔥 Draw Skeleton Connections
    stroke(0, 255, 255); // Cyan color for skeleton
    strokeWeight(2);
    for (let [p1, p2] of skeleton) {
        let kp1 = pose.keypoints.find(kp => kp.part === p1);
        let kp2 = pose.keypoints.find(kp => kp.part === p2);

        if (kp1 && kp2 && kp1.score > 0.2 && kp2.score > 0.2) { 
            if (kp1.position?.x && kp1.position?.y && kp2.position?.x && kp2.position?.y) { // 🔥 Ensure positions are valid
                line(kp1.position.x, kp1.position.y, kp2.position.x, kp2.position.y);
            } else {
                console.warn(`Skipping connection between ${p1} and ${p2}: Missing position data`);
            }
        } else {
            console.warn(`Skipping connection between ${p1} and ${p2}: Low confidence or missing keypoints`);
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
        console.warn("Pose estimation returned undefined data.");
        return;
    }

    console.log("Logging Keypoints:", pose.keypoints); // Debug: Check keypoint structure

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

    predictedClass = bestClass || "Waiting..."; // Ensure text updates
    predictedProb = highestProb || 0;
    currentPose = pose; //Store pose data for visualization
    generateParticles(bestClass);
}

class Particle {
    constructor(x, y, color, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 400 || this.x > 800) this.speedX *= -1;
        if (this.y < 0 || this.y > 400) this.speedY *= -1;
    }
    draw() {
        fill(this.color[0], this.color[1], this.color[2]); // 🔥 Fix: Ensure proper RGB values
        noStroke();
        ellipse(this.x, this.y, 6, 6);
    }
}

function generateParticles(poseLabel) {
    particles = [];
    let particleColor, speedX, speedY;

    for (let i = 0; i < 50; i++) {
        switch (poseLabel) {
            case "oh":
                particleColor = [0, 191, 255]; // Electric Blue
                speedX = random(-3, 3);
                speedY = random(-3, 3);
                break;
            case "dey":
                particleColor = [255, 0, 255]; // Pink
                speedX = sin(frameCount * 0.1) * 2;
                speedY = cos(frameCount * 0.1) * 2;
                break;
            case "shoki":
                particleColor = [50, 205, 50]; // Lime Green
                speedX = random(-2, 2);
                speedY = abs(sin(frameCount * 0.1)) * 3;
                break;
            case "haa":
                particleColor = [255, 140, 0]; // Bright Orange
                speedX = sin(frameCount * 0.2) * 3;
                speedY = cos(frameCount * 0.2) * 3;
                break;
            default:
                particleColor = [200, 200, 200]; // Default Gray
                speedX = random(-1, 1);
                speedY = random(-1, 1);
                break;
        }
        particles.push(new Particle(random(400, 800), random(0, 400), particleColor, speedX, speedY));
    }
}

function updateParticles() {
    for (let p of particles) {
        p.update();
        p.draw();
    }
}


    /* // Assign background colors based on labels (version with static solid colors instead of animated)
    if (bestClass === "oh") bgColor = [0, 191, 255, 180]; // Electric Blue
    else if (bestClass === "dey") bgColor = [255, 0, 255, 180]; // Pink
    else if (bestClass === "shoki") bgColor = [50, 205, 50, 180]; // Lime Green
    else if (bestClass === "haa") bgColor = [255, 140, 0, 180]; // Bright Orange
    else bgColor = [200, 200, 200, 100]; // Default gray

    console.log("Best Prediction:", bestClass, highestProb, "Color:", bgColor);
}

*/
