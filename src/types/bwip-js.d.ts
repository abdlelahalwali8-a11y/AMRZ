declare module 'bwip-js' {
  export interface ToCanvasOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    rotate?: 'N' | 'R' | 'L' | 'I';
    includetext?: boolean;
    textxalign?: 'off' | 'left' | 'center' | 'right';
    backgroundcolor?: string;
    barcolor?: string;
    [key: string]: any;
  }

  export function toCanvas(canvas: string | HTMLCanvasElement, options: ToCanvasOptions): HTMLCanvasElement;
}
