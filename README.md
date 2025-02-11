# shoki-pose-detection
project integrates Teachable Machine Pose Model with p5.js to visualize real-time pose recognition through dynamic color changes
# Teachable Machine + p5.js Pose Detection

### Interactive Pose Recognition with Teachable Machine & p5.js

This project integrates **Google's Teachable Machine Pose Model** with **p5.js** to create a real-time pose recognition system that dynamically visualizes detected poses through color changes. 

---

## Features

- **Real-time Pose Detection** using Teachable Machine
- **Dynamic Color Feedback** based on detected poses
- **Keypoint & Skeleton Visualization** for debugging and accuracy control
- **Runs Directly in Browser** (No external setup needed)
- **Customizable Pose Assignments & Colors**

---

## Pose-to-Color Mapping

| Pose      | Color                         |
| --------- | ----------------------------- |
| **Oh**    | Electric Blue `(0, 191, 255)` |
| **Dey**   | Pink `(255, 20, 147)`         |
| **Shoki** | Lime Green `(50, 205, 50)`    |
| **Haa**   | Bright Orange `(255, 140, 0)` |

---

## How to Run

### **Option 1: Open Locally in Browser**

1. Clone this repository:
    
    ```bash
    git clone https://github.com/yourusername/teachable-machine-p5.git
    ```
    
2. Open the **index.html** file in your browser.
3. Move in front of the webcam and strike a pose!

### **Option 2: Run a Local Server (for Better Performance)**

1. Install a lightweight server:
    
    ```
    npm install -g http-server
    ```
    
2. Navigate to the project folder:
    
    ```
    cd path/to/your/project
    ```
    
3. Start the server:
    
    ```
    http-server -p 8000
    ```
    
4. Copy and paste one of the available URLs provided in the terminal:
    
    ```
    Available on:
    http://127.0.0.1:8000
    http://192.168.x.x:8000
    ```
    
5. Open the provided URL in your browser to test the project.
    
    ```

---

