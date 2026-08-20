import bwipjs from 'bwip-js';

export type BarcodeType = 'pdf417' | 'code128' | 'qrcode' | 'datamatrix' | 'code39' | 'aztec';

export interface BarcodeRenderOptions {
  bcid: BarcodeType;
  text: string;
  scale?: number;
  height?: number;
  width?: number;
  rotate?: 'N' | 'R' | 'L' | 'I';
  includeText?: boolean;
  textXAlign?: 'off' | 'left' | 'center' | 'right';
  backgroundcolor?: string;
  barcolor?: string;
}

/**
 * Renders a barcode onto an HTML Canvas element using bwip-js
 */
export function renderBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  options: BarcodeRenderOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const bwipOptions: Record<string, any> = {
        bcid: options.bcid,
        text: options.text || 'P<SAU123456789',
        scale: options.scale || 3,
        height: options.height || 12,
        rotate: options.rotate || 'N',
        includetext: options.includeText ?? false,
        textxalign: options.textXAlign || 'center',
        backgroundcolor: options.backgroundcolor || 'FFFFFF',
        barcolor: options.barcolor || '000000',
      };

      if (options.width !== undefined && options.width !== null) {
        bwipOptions.width = options.width;
      }

      bwipjs.toCanvas(canvas, bwipOptions as bwipjs.ToCanvasOptions);
      resolve();
    } catch (err) {
      console.error('BWIP-JS render error:', err);
      reject(err);
    }
  });
}

/**
 * Formats data specifically for passport PDF417 2D Barcodes according to ICAO specs
 */
export function formatPassportPDF417Data(
  line1: string,
  line2: string,
  passportNo: string,
  nationalId: string
): string {
  // Official eMRTD / 2D barcode format includes header + MRZ
  return `ICAO_MRTD\nNO:${passportNo}\nID:${nationalId || 'N/A'}\nMRZ:\n${line1}\n${line2}`;
}
