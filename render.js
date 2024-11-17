"use strict";

var lamp = function () {
    var canvas;
    var gl;

    var numPositionsMain = 36;
    var numPositionsUpper = 36;
    var numPositionsBase = baseCylinderPositionsArray.length;
    var numPositionsCone = conePositionsArray.length;
    var numSphereIndices;

    var modelViewMatrixLoc, projectionMatrixLoc, colorUniformLoc;
    var modelViewMatrix, projectionMatrix;
    var eye;

    var near = 0.1;
    var far = 10.0;
    var radius = 2.0;
    var theta = 0.0; // Horizontal rotation angle
    var phi = 0.0;   // Vertical rotation angle
    var fovy = 45.0;
    var aspect;

    const cameraSpeed = 0.05;
    const fovSpeed = 2.0;
    const at = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);

    var isOn = false;

    var mainArmRotation = 0.0; // Rotation of the main arm
    var upperArmRotation = 0.0; // Rotation of the upper arm
    var headRotation = 0.0; // Rotation of the lamp head
    var headRightLeft = 0.0; // Rotation of the lamp head

    function init() {
        canvas = document.getElementById("gl-canvas");

        // Ensure canvas captures keyboard events
        canvas.setAttribute("tabindex", "0");
        canvas.focus();

        var realWidth = canvas.clientWidth;
        var realHeight = canvas.clientHeight;
        var pixelRatio = window.devicePixelRatio || 1;
        canvas.width = realWidth * pixelRatio;
        canvas.height = realHeight * pixelRatio;

        gl = canvas.getContext("webgl2");
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect = canvas.width / canvas.height;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Build the main, upper cubes, base cylinder, and cone shade
        colorMainCube();
        colorUpperCube();
        colorCone();

        // Create and load buffer for the main cube
        var vBufferMain = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mainCubePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the upper cube
        var vBufferUpper = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(upperCubePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the base cylinder
        var vBufferBase = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(baseCylinderPositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the cone shade
        var vBufferCone = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(conePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the sphere (light bulb)
        createSphere(0.05, 20, 20); // Radius 0.05
        console.log("Sphere Positions:", spherePositionsArray);
        console.log("Sphere Indices:", sphereIndices);

        var vBufferSphere = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(spherePositionsArray), gl.STATIC_DRAW);

        var iBufferSphere = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferSphere);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
        numSphereIndices = sphereIndices.length;

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(positionLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        colorUniformLoc = gl.getUniformLocation(program, "uColor");

        // Attach event listener for keyboard input
        window.addEventListener("keydown", handleKeyDown);
        
        const toggleLightButton = document.getElementById("toggleLight");

        // Set initial button label and color
        toggleLightButton.textContent = isOn ? "Turn Off" : "Turn On";
        toggleLightButton.style.backgroundColor = isOn ? "red" : "green"; // Set initial color
        
        toggleLightButton.addEventListener("click", () => {
            isOn = !isOn; // Toggle the light state
            toggleLightButton.textContent = isOn ? "Turn Off" : "Turn On"; // Update button label
            toggleLightButton.style.backgroundColor = isOn ? "red" : "green"; // Update button color
            console.log("Light state:", isOn ? "On" : "Off");
        });
        

        render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, vBufferSphere, iBufferSphere, positionLoc);
    }

    function render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, vBufferSphere, iBufferSphere, positionLoc) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Calculate camera position
        eye = vec3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(phi),
            radius * Math.cos(theta) * Math.cos(phi)
        );

        // Dynamic 'up' vector to avoid flipping
        const adjustedUp = vec3(0.0, Math.cos(phi) >= 0 ? 1.0 : -1.0, 0.0);

        // Set up projection matrix
        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // Draw the base cylinder
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(lookAt(eye, at, adjustedUp), translate(0.0, -0.4, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.3, 0.3, 0.3, 1.0))); // Gray color for the base
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsBase);

        // Draw the main cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.35, 0.0));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.35, 0.0)); 
        modelViewMatrix = mult(modelViewMatrix, rotate(mainArmRotation, vec3(0, 0, 1)));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.35, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.0, 0.0, 0.0, 1.0))); // Black color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsMain);

        // Draw the upper cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(modelViewMatrix, translate(-0.175, 0.5, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotateZ(45));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.25, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotate(upperArmRotation, vec3(0, 0, 1)));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.25, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.5, 0.5, 0.5, 1.0))); // Gray color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsUpper);

        // Draw the cone shade
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);

        var coneRotation = rotateX(180); // Rotate cone to point downward
        var coneTranslation = mult(translate(-0.25, 0.25, 0.0), rotateZ(90)); // Align cone with upper cube
        var coneTransform = mult(coneTranslation, coneRotation);
        modelViewMatrix = mult(modelViewMatrix, coneTransform);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.175, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotate(headRotation, vec3(0, 0, 1))); // Step 2: Rotate around origin
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.175, 0.0));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.25, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotate(headRightLeft, vec3(1, 0, 0))); // Step 2: Rotate around origin
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.25, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.8, 0.8, 0.8, 1.0))); // Light gray color for the cone shade
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsCone);

        // Draw the sphere (light bulb)
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferSphere);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.20, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotateX(mainArmRotation));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(1.0, 1.0, 0.0, 1.0))); // Yellow color for the bulb

        if (isOn) {
            gl.uniform4fv(colorUniformLoc, flatten(vec4(1.0, 1.0, 0.0, 1.0))); // Yellow (on)
        } else {
            gl.uniform4fv(colorUniformLoc, flatten(vec4(0.3, 0.3, 0.3, 1.0))); // Dark gray (off)
        }

        gl.drawElements(gl.TRIANGLES, numSphereIndices, gl.UNSIGNED_SHORT, 0);

        // Request the next frame
        requestAnimationFrame(() => render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, vBufferSphere, iBufferSphere, positionLoc));
    }

    function handleKeyDown(event) {
        console.log("Key pressed:", event.key); // Debugging
        switch (event.key) {
            case "ArrowUp": mainArmRotation += 5.0; break; // Rotate main arm
            case "ArrowDown": mainArmRotation -= 5.0; break; // Rotate main arm
            case "ArrowLeft": upperArmRotation -= 5.0; break; // Rotate upper arm
            case "ArrowRight": upperArmRotation += 5.0; break; // Rotate upper arm
            case "h": headRotation = Math.min(headRotation + 5.0, 25.0); break;
            case "k": headRotation = Math.max(headRotation - 5.0, -25.0); break;
            case "u": headRightLeft += 5.0; break;
            case "j": headRightLeft -= 5.0; break;
            case "q": radius = Math.max(near + 0.1, radius - cameraSpeed); break;
            case "e": radius = Math.min(far - 0.1, radius + cameraSpeed); break;
            case "d": theta = (theta - cameraSpeed + 2 * Math.PI) % (2 * Math.PI); break;
            case "a": theta = (theta + cameraSpeed) % (2 * Math.PI); break;
            case "s": phi = (phi + cameraSpeed) % (2 * Math.PI); break;
            case "w": phi = (phi - cameraSpeed + 2 * Math.PI) % (2 * Math.PI); break;
            case "z": fovy = Math.max(10.0, fovy - fovSpeed); break;
            case "x": fovy = Math.min(90.0, fovy + fovSpeed); break;
        }
    }

    init();
};

lamp();
