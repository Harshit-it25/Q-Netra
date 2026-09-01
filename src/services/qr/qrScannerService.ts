import jsQR from 'jsqr';
import { parseUpiUri, ParsedUpiData } from './upiParserService';

export interface CameraStreamResult {
  stream: MediaStream;
  videoElement: HTMLVideoElement;
}

export class QrScannerService {
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  /**
   * Initializes media stream requesting rear-facing environment camera.
   */
  async startCamera(video: HTMLVideoElement): Promise<MediaStream> {
    this.stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    this.stream = stream;
    video.srcObject = stream;
    await video.play();

    return stream;
  }

  /**
   * Starts local in-memory frame decoding loop using HTML5 Canvas & jsQR.
   * Zero frame payloads leave client memory.
   */
  startDecoding(
    video: HTMLVideoElement,
    onQrFound: (data: ParsedUpiData) => void
  ): void {
    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
      this.canvasCtx = this.canvasElement.getContext('2d', { willReadFrequently: true });
    }

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && this.canvasCtx && this.canvasElement) {
        this.canvasElement.height = video.videoHeight;
        this.canvasElement.width = video.videoWidth;
        this.canvasCtx.drawImage(video, 0, 0, this.canvasElement.width, this.canvasElement.height);

        const imageData = this.canvasCtx.getImageData(
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          const parsed = parseUpiUri(code.data);
          this.stopCamera();
          onQrFound(parsed);
          return;
        }
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  /**
   * Halts all active media tracks immediately.
   */
  stopCamera(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
  }
}
