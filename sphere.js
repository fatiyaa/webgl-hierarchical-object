"use strict";

var spherePositionsArray = [];
var sphereIndices = [];
var sphereResolution = 30; // Adjust for smoother or coarser sphere

function createSphere(radius = 0.1, latBands = sphereResolution, longBands = sphereResolution) {
    let vertices = [];
    
    for (let lat = 0; lat <= latBands; lat++) {
        let theta = (lat * Math.PI) / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let long = 0; long <= longBands; long++) {
            let phi = (long * 2 * Math.PI) / longBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            vertices.push(vec4(radius * x, radius * y, radius * z, 1.0));
        }
    }

    for (let lat = 0; lat < latBands; lat++) {
        for (let long = 0; long < longBands; long++) {
            let first = (lat * (longBands + 1)) + long;
            let second = first + longBands + 1;

            sphereIndices.push(first, second, first + 1);
            sphereIndices.push(second, second + 1, first + 1);
        }
    }

    spherePositionsArray = vertices;
}
createSphere();
