import * as faceapi from "face-api.js";

const MATCH_THRESHOLD = 0.42;
const MIN_DETECTION_SCORE = 0.75;
const MIN_FACE_RATIO = 0.12;
const MAX_YAW_RATIO = 0.12;
const MAX_ROLL_RATIO = 0.08;
const MIN_BRIGHTNESS = 55;
const MIN_SHARPNESS = 7;

let isLoaded = false;

type FaceAnalysisError =
  | "no-face"
  | "multiple-faces"
  | "low-confidence"
  | "face-too-small"
  | "face-not-frontal"
  | "image-too-dark"
  | "image-too-blurry";

type FaceMetrics = {
  descriptor: Float32Array;
  detectionScore: number;
  faceRatio: number;
  yawRatio: number;
  rollRatio: number;
  brightness: number;
  sharpness: number;
};

type FaceAnalysisResult =
  | {
      ok: true;
      metrics: FaceMetrics;
    }
  | {
      ok: false;
      error: FaceAnalysisError;
    };

function createDetectionOptions() {
  return new faceapi.SsdMobilenetv1Options({
    minConfidence: MIN_DETECTION_SCORE,
  });
}

function getImageSize(img: HTMLImageElement) {
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function analyzeImageQuality(img: HTMLImageElement, box: faceapi.Box) {
  const { width, height } = getImageSize(img);
  const paddingX = box.width * 0.18;
  const paddingY = box.height * 0.22;
  const cropX = clamp(Math.floor(box.x - paddingX), 0, Math.max(width - 1, 0));
  const cropY = clamp(Math.floor(box.y - paddingY), 0, Math.max(height - 1, 0));
  const cropWidth = clamp(
    Math.floor(box.width + paddingX * 2),
    1,
    Math.max(width - cropX, 1)
  );
  const cropHeight = clamp(
    Math.floor(box.height + paddingY * 2),
    1,
    Math.max(height - cropY, 1)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.min(cropWidth, 220);
  canvas.height = Math.min(cropHeight, 220);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { brightness: 0, sharpness: 0 };
  }

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const gray = new Float32Array(canvas.width * canvas.height);

  let brightnessSum = 0;

  for (let i = 0, px = 0; i < data.length; i += 4, px += 1) {
    const luminance = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    gray[px] = luminance;
    brightnessSum += luminance;
  }

  let edgeSum = 0;
  let edgeCount = 0;

  for (let y = 1; y < canvas.height - 1; y += 1) {
    for (let x = 1; x < canvas.width - 1; x += 1) {
      const index = y * canvas.width + x;
      const gx = gray[index + 1] - gray[index - 1];
      const gy = gray[index + canvas.width] - gray[index - canvas.width];
      edgeSum += Math.abs(gx) + Math.abs(gy);
      edgeCount += 1;
    }
  }

  return {
    brightness: brightnessSum / gray.length,
    sharpness: edgeCount > 0 ? edgeSum / edgeCount : 0,
  };
}

function getPoseRatios(landmarks: faceapi.FaceLandmarks68) {
  const jaw = landmarks.getJawOutline();
  const nose = landmarks.getNose();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const jawLeft = jaw[0];
  const jawRight = jaw[16];
  const noseTip = nose[3];
  const leftEyeCenter = leftEye.reduce(
    (acc, point) => ({ x: acc.x + point.x / leftEye.length, y: acc.y + point.y / leftEye.length }),
    { x: 0, y: 0 }
  );
  const rightEyeCenter = rightEye.reduce(
    (acc, point) => ({ x: acc.x + point.x / rightEye.length, y: acc.y + point.y / rightEye.length }),
    { x: 0, y: 0 }
  );

  const faceWidth = Math.max(jawRight.x - jawLeft.x, 1);
  const jawCenterX = (jawLeft.x + jawRight.x) / 2;
  const yawRatio = Math.abs(noseTip.x - jawCenterX) / faceWidth;
  const rollRatio = Math.abs(leftEyeCenter.y - rightEyeCenter.y) / faceWidth;

  return { yawRatio, rollRatio };
}

export async function loadFaceModels() {
  if (isLoaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

  isLoaded = true;
}

export async function analyzeFace(img: HTMLImageElement): Promise<FaceAnalysisResult> {
  const detections = await faceapi
    .detectAllFaces(img, createDetectionOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    return { ok: false, error: "no-face" };
  }

  if (detections.length > 1) {
    return { ok: false, error: "multiple-faces" };
  }

  const [detection] = detections;
  const { width, height } = getImageSize(img);
  const faceArea = detection.detection.box.width * detection.detection.box.height;
  const imageArea = Math.max(width * height, 1);
  const faceRatio = faceArea / imageArea;

  if (detection.detection.score < MIN_DETECTION_SCORE) {
    return { ok: false, error: "low-confidence" };
  }

  if (faceRatio < MIN_FACE_RATIO) {
    return { ok: false, error: "face-too-small" };
  }

  const { yawRatio, rollRatio } = getPoseRatios(detection.landmarks);
  if (yawRatio > MAX_YAW_RATIO || rollRatio > MAX_ROLL_RATIO) {
    return { ok: false, error: "face-not-frontal" };
  }

  const { brightness, sharpness } = analyzeImageQuality(img, detection.detection.box);
  const minSharpness = faceRatio >= 0.2 ? MIN_SHARPNESS : MIN_SHARPNESS - 1.5;

  if (brightness < MIN_BRIGHTNESS) {
    return { ok: false, error: "image-too-dark" };
  }

  if (sharpness < minSharpness) {
    return { ok: false, error: "image-too-blurry" };
  }

  return {
    ok: true,
    metrics: {
      descriptor: detection.descriptor,
      detectionScore: detection.detection.score,
      faceRatio,
      yawRatio,
      rollRatio,
      brightness,
      sharpness,
    },
  };
}

export function compareFace(desc1: Float32Array, desc2: Float32Array) {
  const distance = faceapi.euclideanDistance(desc1, desc2);

  return {
    distance,
    isMatch: distance <= MATCH_THRESHOLD,
    threshold: MATCH_THRESHOLD,
  };
}

export function getFaceAnalysisErrorMessage(error: FaceAnalysisError) {
  switch (error) {
    case "no-face":
      return "Wajah tidak terdeteksi. Pastikan wajah masuk ke dalam frame.";
    case "multiple-faces":
      return "Terdeteksi lebih dari satu wajah. Hanya satu orang yang boleh ada di kamera.";
    case "low-confidence":
      return "Deteksi wajah tidak cukup yakin. Coba ulangi dengan posisi yang lebih jelas.";
    case "face-too-small":
      return "Wajah terlalu jauh dari kamera. Dekatkan wajah Anda ke kamera.";
    case "face-not-frontal":
      return "Wajah harus menghadap lurus ke kamera.";
    case "image-too-dark":
      return "Pencahayaan terlalu gelap. Cari tempat yang lebih terang.";
    case "image-too-blurry":
      return "Gambar terlalu blur. Tahan kamera lebih stabil lalu coba lagi.";
    default:
      return "Verifikasi wajah gagal. Silakan coba lagi.";
  }
}
