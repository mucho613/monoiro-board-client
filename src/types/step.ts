import { Tool } from './tool';

export type Step = {
  userId: string;
  isActive: boolean;
  stroke: Array<{x: number, y: number, force: number}>;
  tool: Tool;
  convertedImage: ImageData;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export default Step;
