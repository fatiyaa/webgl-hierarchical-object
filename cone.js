// cone_shade.js
"use strict";

var conePositionsArray = [];
var coneVertices = [];
var coneSegments = 30; // Number of segments to approximate the circular base

function createConeVertices(radius = 0.15, height = 0.35) {
    // Generate vertices for the base of the cone
    for (let i = 0; i < coneSegments; i++) {
        let angle = (i / coneSegments) * 2 * Math.PI;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);

        // Base circle vertices
        coneVertices.push(vec4(x, 0.0, z, 1.0));
    }

    // Tip of the cone
    var coneTip = vec4(0.0, height, 0.0, 1.0);
    coneVertices.push(coneTip); // Last index is the tip
}

function colorCone() {
    // Define the faces of the cone using the base vertices and the tip
    var coneTipIndex = coneVertices.length - 1;

    for (let i = 0; i < coneSegments; i++) {
        let next = (i + 1) % coneSegments;

        // Triangle for each face of the cone
        conePositionsArray.push(coneVertices[i]);
        conePositionsArray.push(coneVertices[next]);
        conePositionsArray.push(coneVertices[coneTipIndex]);
    }
}

// Initialize the vertices for the cone
createConeVertices();
colorCone();
