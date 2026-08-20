declare module 'bwip-js' {
  export interface ToCanvasOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textxalign?: 'center' | 'left' | 'right' | 'off';
    backgroundcolor?: string;
    barcolor?: string;
    paddingwidth?: number;
    paddingheight?: number;
    rotate?: 'N' | 'R' | 'L' | 'I';
    eclevel?: number;
    columns?: number;
    rows?: number;
  }

  export function toCanvas(canvas: HTMLCanvasElement | string, options: ToCanvasOptions): Promise<HTMLCanvasElement>;
  export function toBuffer(options: ToCanvasOptions): Promise<Buffer>;
}
