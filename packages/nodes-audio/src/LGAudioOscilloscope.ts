import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

var currentTime = 0
export default class LGAudioOscilloscope extends LGraphNode {
  _last_buffer
  start_time;
  constructor() {
    super();
    this.addInput("xy", "buffer");
    this.size = [300, 200];
    this._last_buffer = null;
    this.start_time = Date.now();
  }

  onExecute() {
    this._last_buffer =  this.getInputData(0)
    this.setDirtyCanvas(true, false);
  }
  onDrawForeground(ctx) {
    if (!this._last_buffer) {
      return;
    }

    const audioBuffer =  this._last_buffer
    const audioContext = LGAudio.getAudioContext()
    const currentTime = audioContext.currentTime;
    const leftChannel = audioBuffer.getChannelData(0); // 获取左声道数据  
    const rightChannel = audioBuffer.getChannelData(1); // 获取右声道数据  
    // draw back
    const [width, height] = this.size;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.size[0], this.size[1]);
    // draw line
    ctx.strokeStyle = "white";
    ctx.beginPath();
     // 选择适当的步长，确保不会超出数组边界 
     const fps = 60;
     const step = Math.floor(audioContext.sampleRate * 1 / fps);
     const startSample = Math.floor(currentTime * audioContext.sampleRate);  
     const endSample = Math.min(startSample + step, leftChannel.length);  
 
     for (let i = startSample; i < endSample; i++) {  
         const x = (leftChannel[i] * (width / 2)) + (width / 2);  
         const y = (rightChannel[i] * (height / 2)) + (height / 2);  
         ctx.lineTo(x, y);  
     }  
     ctx.stroke();
    //  currentTime += 1/ fps;
    //  if (currentTime * audioContext.sampleRate >= leftChannel.length) {
    //   currentTime = 0;
    //  }
  }
}
