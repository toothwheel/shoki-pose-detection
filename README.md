# shoki-pose-detection
project integrates Teachable Machine Pose Model with p5.js to visualize real-time pose recognition through dynamic color changes
# Teachable Machine + p5.js Pose Detection

### Interactive Pose Recognition with Teachable Machine & p5.js

This project integrates **Google's Teachable Machine Pose Model** with **p5.js** to create a real-time pose recognition system that dynamically visualizes detected poses through color changes. The goal is to make AI-based movement detection both **interactive and visually engaging**.

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

4. Open the terminal and navigate to the project folder:
    
    ```bash
    cd teachable-machine-p5
    ```
    
5. Start a simple local server:
    
    ```bash
    python3 -m http.server 8000
    ```
    
6. Open your browser and go to:
    
    ```
    http://localhost:8000/
    ```
    

---

## Customization

- Modify `sketch.js` to **change colors**, **add animations**, or **adjust sensitivity**.
- Change **pose names and assignments** to fit different models.
- Experiment with **different visual effects** like shape overlays or motion tracking.

---

## Future Improvements

- 🔹 Add **sound effects** for detected poses
- 🔹 Implement **gesture-based interactions**
- 🔹 Allow users to **train new pose models dynamically**

---

## Contributing

7. **Fork this repository**
8. Create a **new branch** (`feature-new-effect`)
9. Make changes and **commit**
10. Submit a **Pull Request** 

---

## License

This project is licensed under the **MIT License**. Feel free to use and modify it!

---

