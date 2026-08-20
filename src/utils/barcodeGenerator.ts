import bwipjs from 'bwip-js';
import { PassportData, BarcodeConfig } from '../types/passport';
import { generateTD3MRZ } from './mrzGenerator';

export function buildBarcodePayload(passport: PassportData, config: BarcodeConfig): string {
  const mrz = generateTD3MRZ(passport);

  if (config.type === 'pdf417') {
    // Official ICAO / Border control format
    const lines = [
      `I<${passport.issuingState || 'YEM'}${passport.passportNumber || ''}`,
      `${passport.surname || ''}<<${passport.givenNames || ''}`,
      `${passport.nationality || 'YEM'}|${passport.birthDate || ''}|${passport.sex || 'M'}|${passport.expiryDate || ''}`,
      `${mrz.line1}`,
      `${mrz.line2}`
    ];

    if (passport.personalNumber) {
      lines.push(`ID:${passport.personalNumber}`);
    }

    if (config.customPrefix) {
      return `${config.customPrefix}\n${lines.join('\n')}`;
    }

    return lines.join('\n');
  }

  if (config.includeMRZ && !config.includePersonalData) {
    return `${mrz.line1}\n${mrz.line2}`;
  }

  if (config.includeRawJson) {
    return JSON.stringify({
      doc: passport.documentType || 'P',
      state: passport.issuingState,
      num: passport.passportNumber,
      sur: passport.surname,
      giv: passport.givenNames,
      nat: passport.nationality,
      dob: passport.birthDate,
      sex: passport.sex,
      exp: passport.expiryDate,
      mrz1: mrz.line1,
      mrz2: mrz.line2
    });
  }

  return `${mrz.line1}\n${mrz.line2}`;
}

export async function renderBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  config: BarcodeConfig
): Promise<void> {
  if (!canvas || !text) return;

  const bcidMap: Record<string, string> = {
    pdf417: 'pdf417',
    qrcode: 'qrcode',
    datamatrix: 'datamatrix',
    code128: 'code128'
  };

  const bcid = bcidMap[config.type] || 'pdf417';

  try {
    await bwipjs.toCanvas(canvas, {
      bcid,
      text,
      scale: config.scale || 3,
      height: config.type === 'pdf417' ? 12 : 15,
      includetext: config.type === 'code128',
      textxalign: 'center',
      backgroundcolor: 'ffffff',
      barcolor: '000000',
      paddingwidth: 10,
      paddingheight: 10,
      eclevel: config.type === 'pdf417' ? (config.securityLevel ?? 4) : undefined
    });
  } catch (err) {
    console.error('Barcode rendering error:', err);
    throw err;
  }
}
