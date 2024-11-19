"use strict";

var lamp = function () {
    var canvas;
    var gl;

    var numPositionsMain = 36;
    var numPositionsUpper = 36;
    var numPositionsBase = baseCylinderPositionsArray.length;
    var numPositionsCone = conePositionsArray.length;
    var numSphereIndices;

    var modelViewMatrixLoc, projectionMatrixLoc, colorUniformLoc, useTextureLoc;
    var modelViewMatrix, projectionMatrix;
    var eye;

    var near = 0.1;
    var far = 10.0;
    var radius = 2.0;
    var theta = 0.0; // Horizontal rotation angle
    var phi = 0.0; // Vertical rotation angle
    var fovy = 45.0;
    var aspect;

    const cameraSpeed = 0.05;
    const fovSpeed = 2.0;
    const at = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);

    var isOn = false;
    
    var woodTexture = "wood.jpg"; // Path to the wood texture image

    var mainArmRotation = 0.0; // Rotation of the main arm
    var upperArmRotation = 0.0; // Rotation of the upper arm
    var headRotation = 0.0; // Rotation of the lamp head
    var headRightLeft = 0.0; // Rotation of the lamp head

    function loadTexture(gl, url) {
        var texture = gl.createTexture();
        var image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        image.src = url;
        return texture;
    }

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

        // enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Build the main, upper cubes, base cylinder, and cone shade
        colorMainCube();
        colorUpperCube();
        colorCone();

        // Create and load buffer for the main cube
        var vBufferMain = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            flatten(mainCubePositionsArray),
            gl.STATIC_DRAW
        );

        // Create and load buffer for the upper cube
        var vBufferUpper = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            flatten(upperCubePositionsArray),
            gl.STATIC_DRAW
        );

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsUpperCubeArray), gl.STATIC_DRAW);
        
        // gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(texCoordLoc);

        // Create and load buffer for the base cylinder
        var vBufferBase = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            flatten(baseCylinderPositionsArray),
            gl.STATIC_DRAW
        );

        // Create and load buffer for the cone shade
        var vBufferCone = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            flatten(conePositionsArray),
            gl.STATIC_DRAW
        );

        // Create and load buffer for the sphere (light bulb)
        createSphere(0.05, 20, 20); // Radius 0.05
        console.log("Sphere Positions:", spherePositionsArray);
        console.log("Sphere Indices:", sphereIndices);

        var vBufferSphere = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            flatten(spherePositionsArray),
            gl.STATIC_DRAW
        );

        var iBufferSphere = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferSphere);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(sphereIndices),
            gl.STATIC_DRAW
        );
        numSphereIndices = sphereIndices.length;

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(positionLoc);
        
        var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(
            program,
            "uProjectionMatrix"
        );
        colorUniformLoc = gl.getUniformLocation(program, "uColor");
        useTextureLoc = gl.getUniformLocation(program, "uUseTexture");

        // Use the wood texture here
        var texture = loadTexture(gl, woodTexture);

        window.addEventListener("keydown", function (event) {
            // Mencegah scroll untuk ArrowUp dan ArrowDown
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
            }
        
            // Panggil fungsi handleKeyDown untuk logika lain
            handleKeyDown(event);
        });

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

        render(
            vBufferMain,
            vBufferUpper,
            vBufferBase,
            vBufferCone,
            vBufferSphere,
            iBufferSphere,
            positionLoc,
            texCoordLoc,
            useTextureLoc,
            texture
        );
    }

    function render(
        vBufferMain,
        vBufferUpper,
        vBufferBase,
        vBufferCone,
        vBufferSphere,
        iBufferSphere,
        positionLoc,
        texCoordLoc,
        useTextureLoc,
        texture
    ) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Calculate camera position
        eye = vec3(
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.sin(phi),
            radius * Math.cos(theta) * Math.cos(phi)
        );

        const adjustedUp = vec3(0.0, Math.cos(phi) >= 0 ? 1.0 : -1.0, 0.0);

        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(
            projectionMatrixLoc,
            false,
            flatten(projectionMatrix)
        );

        // Draw the base cylinder
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.uniform1i(useTextureLoc, false);
        modelViewMatrix = mult(
            lookAt(eye, at, adjustedUp),
            translate(0.0, -0.4, 0.0)
        );
        gl.uniformMatrix4fv(
            modelViewMatrixLoc,
            false,
            flatten(modelViewMatrix)
        );
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.7216, 0.5922, 0.4706, 1.0)));
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsBase);

        // Draw the main cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.uniform1i(useTextureLoc, false);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.35, 0.0));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.35, 0.0));
        modelViewMatrix = mult(
            modelViewMatrix,
            rotate(mainArmRotation, vec3(0, 0, 1))
        );
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.35, 0.0));
        gl.uniformMatrix4fv(
            modelViewMatrixLoc,
            false,
            flatten(modelViewMatrix)
        );
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.0, 0.0, 0.0, 1.0)));
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsMain);

        // Draw the upper cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1i(useTextureLoc, true);
        gl.enableVertexAttribArray(texCoordLoc);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        modelViewMatrix = mult(modelViewMatrix, translate(-0.175, 0.5, 0.0));
        modelViewMatrix = mult(modelViewMatrix, rotateZ(45));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.25, 0.0));
        modelViewMatrix = mult(
            modelViewMatrix,
            rotate(upperArmRotation, vec3(0, 0, 1))
        );
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.25, 0.0));
        gl.uniformMatrix4fv(
            modelViewMatrixLoc,
            false,
            flatten(modelViewMatrix)
        );
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsUpper);

        // Draw the cone shade
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.uniform1i(useTextureLoc, false);
        var coneRotation = rotateX(180); // Rotate cone to point downward
        var coneTranslation = mult(translate(-0.25, 0.25, 0.0), rotateZ(90)); // Align cone with upper cube
        var coneTransform = mult(coneTranslation, coneRotation);
        modelViewMatrix = mult(modelViewMatrix, coneTransform);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.175, 0.0));
        modelViewMatrix = mult(
            modelViewMatrix,
            rotate(headRotation, vec3(0, 0, 1))
        );
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.175, 0.0));
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.25, 0.0));
        modelViewMatrix = mult(
            modelViewMatrix,
            rotate(headRightLeft, vec3(1, 0, 0))
        );
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.25, 0.0));
        gl.uniformMatrix4fv(
            modelViewMatrixLoc,
            false,
            flatten(modelViewMatrix)
        );
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.7216, 0.5922, 0.4706, 1.0)));
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsCone);

        // Draw the sphere (light bulb)
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.uniform1i(useTextureLoc, false);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferSphere);
        modelViewMatrix = mult(modelViewMatrix, translate(0.0, 0.2, 0.0));
        gl.uniformMatrix4fv(
            modelViewMatrixLoc,
            false,
            flatten(modelViewMatrix)
        );
        gl.uniform4fv(
            colorUniformLoc,
            flatten(isOn ? vec4(0.9, 0.8, 0.0, 1.0) : vec4(0.3, 0.3, 0.3, 1.0))
        );
        gl.drawElements(gl.TRIANGLES, numSphereIndices, gl.UNSIGNED_SHORT, 0);

        // Add light cone with realistic effect
        if (isOn) {
            // First, render the light cone with gradual fading of layers
            var bulbTransform = mult(
                modelViewMatrix,
                translate(0.0, -0.4, 0.0) // Position the light cone base
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
            gl.vertexAttribPointer(bulbTransform, 4, gl.FLOAT, false, 0, 0);

            var coneBaseTransform = mult(
                modelViewMatrix,
                translate(0.0, 0.25, 0.0) // Adjust base positioning of the cone
            );
            gl.uniformMatrix4fv(
                modelViewMatrixLoc,
                false,
                flatten(coneBaseTransform)
            );

            // Gradual fading of light cone layers
            for (let i = 0; i < 100; i++) {
                var lightLayerScale = 1.5 + i * 0.015; // Gradually larger
                var lightLayerTransparency = 0.8 - i * 0.01; // Gradually more transparent
                var lightLayerColor = vec4(
                    1.0,
                    1.0 - i * 0.005,
                    0.0,
                    lightLayerTransparency
                ); // Gradual yellow with transparency

                var coneLightTransform = mult(
                    bulbTransform,
                    translate(0.0, -(i * 0.01), 0.0)
                ); // Spread outward
                coneLightTransform = mult(
                    coneLightTransform,
                    scale(lightLayerScale, lightLayerScale, lightLayerScale)
                );

                gl.uniformMatrix4fv(
                    modelViewMatrixLoc,
                    false,
                    flatten(coneLightTransform)
                );
                gl.uniform4fv(colorUniformLoc, flatten(lightLayerColor));

                gl.drawArrays(gl.TRIANGLES, 0, numPositionsCone);
            }
        }

        // Request the next frame
        requestAnimationFrame(() =>
            render(
                vBufferMain,
                vBufferUpper,
                vBufferBase,
                vBufferCone,
                vBufferSphere,
                iBufferSphere,
                positionLoc,
                texCoordLoc,
                useTextureLoc,
                texture
            )
        );
    }

    function handleKeyDown(event) {
        console.log("Key pressed:", event.key); // Debugging
        switch (event.key) {
            case "ArrowUp":
                mainArmRotation += 5.0;
                break; // Rotate main arm
            case "ArrowDown":
                mainArmRotation -= 5.0;
                break; // Rotate main arm
            case "ArrowLeft":
                upperArmRotation -= 5.0;
                break; // Rotate upper arm
            case "ArrowRight":
                upperArmRotation += 5.0;
                break; // Rotate upper arm
            case "h":
                headRotation = Math.min(headRotation + 5.0, 25.0);
                break;
            case "k":
                headRotation = Math.max(headRotation - 5.0, -25.0);
                break;
            case "u":
                headRightLeft += 5.0;
                break;
            case "j":
                headRightLeft -= 5.0;
                break;
            case "q":
                radius = Math.max(near + 0.1, radius - cameraSpeed);
                break;
            case "e":
                radius = Math.min(far - 0.1, radius + cameraSpeed);
                break;
            case "d":
                theta = (theta - cameraSpeed + 2 * Math.PI) % (2 * Math.PI);
                break;
            case "a":
                theta = (theta + cameraSpeed) % (2 * Math.PI);
                break;
            case "s":
                phi = (phi + cameraSpeed) % (2 * Math.PI);
                break;
            case "w":
                phi = (phi - cameraSpeed + 2 * Math.PI) % (2 * Math.PI);
                break;
            case "z":
                fovy = Math.max(10.0, fovy - fovSpeed);
                break;
            case "x":
                fovy = Math.min(90.0, fovy + fovSpeed);
                break;
        }
    }

    init();
};

lamp();
