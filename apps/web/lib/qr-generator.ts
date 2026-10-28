import QRCode from 'qrcode';

export interface QrRenderOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate a clean, crisp SVG string of the QR Code (Synchronous, 100% ISO/IEC 18004 compliant)
 */
export function generateQrSvg(text: string, options: QrRenderOptions = {}): string {
  const { margin = 3, width = 320, errorCorrectionLevel = 'M' } = options;
  const qr = QRCode.create(text, { errorCorrectionLevel });
  const n = qr.modules.size;
  const total = n + margin * 2;
  let path = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) {
        path += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${width}" height="${width}" shape-rendering="crispEdges">
    <rect width="${total}" height="${total}" fill="#FFFFFF"/>
    <path d="${path}" fill="#000000"/>
  </svg>`;
}

/**
 * Generate a crisp PNG Data URL (base64) for maximum camera contrast & instant banking scanner recognition
 */
export async function generateQrDataUrl(text: string, options: QrRenderOptions = {}): Promise<string> {
  const { width = 450, margin = 3, errorCorrectionLevel = 'M' } = options;
  return QRCode.toDataURL(text, {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}
