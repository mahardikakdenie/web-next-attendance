import * as faceapi from "face-api.js";

let isLoaded = false;

export async function loadFaceModels() {
  if (isLoaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

  isLoaded = true;
}

export async function getFaceDescriptor(img: HTMLImageElement) {
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor || null;
}

export function compareFace(
  desc1: Float32Array,
  desc2: Float32Array
) {
  const distance = faceapi.euclideanDistance(desc1, desc2);

  return {
    distance,
    isMatch: distance < 0.6,
  };
}
