declare module 'gif.js' {
  export default class GIF {
    constructor(options?: any);
    on(event: string, callback: Function): void;
    addFrame(element: HTMLCanvasElement | HTMLImageElement, options?: any): void;
    render(): void;
  }
}
