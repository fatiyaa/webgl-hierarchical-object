// base_cylinder.js
"use strict";

var baseCylinderPositionsArray = [];
var baseCylinderVertices = [];
var cylinderSegments = 30; // Number of segments to approximate the cylinder

function createCylinderVertices(radius = 0.2, height = 0.075) {
    // Generate vertices for the sides and caps of the cylinder
    for (let i = 0; i < cylinderSegments; i++) {
        let angle = (i / cylinderSegments) * 2 * Math.PI;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);

        // Bottom circle
        baseCylinderVertices.push(vec4(x, -height / 2, z, 1.0));

        // Top circle
        baseCylinderVertices.push(vec4(x, height / 2, z, 1.0));
    }

    // Center points for the top and bottom caps
    var bottomCenter = vec4(0.0, -height / 2, 0.0, 1.0);
    var topCenter = vec4(0.0, height / 2, 0.0, 1.0);

    baseCylinderVertices.push(bottomCenter); // Last index for bottom center
    baseCylinderVertices.push(topCenter);    // Second last index for top center
}

function colorBaseCylinder() {
    // Define the faces of the cylinder using the vertices
    for (let i = 0; i < cylinderSegments; i++) {
        let next = (i + 1) % cylinderSegments;

        // Side faces
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * i]);
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * i + 1]);
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * next]);

        baseCylinderPositionsArray.push(baseCylinderVertices[2 * i + 1]);
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * next + 1]);
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * next]);

        // Bottom cap
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * i]);
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * next]);
        baseCylinderPositionsArray.push(baseCylinderVertices[baseCylinderVertices.length - 2]); // Bottom center

        // Top cap
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * i + 1]);
        baseCylinderPositionsArray.push(baseCylinderVertices[baseCylinderVertices.length - 1]); // Top center
        baseCylinderPositionsArray.push(baseCylinderVertices[2 * next + 1]);
    }
}

// Initialize the vertices for the cylinder
createCylinderVertices();
colorBaseCylinder();
