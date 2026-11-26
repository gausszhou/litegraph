/**
 * jsdom 没有实现 Web Audio API。节点契约测试需要实例化音频节点，
 * 这里提供一个足够覆盖节点构造与序列化的最小 AudioContext 替身。
 */
class FakeAudioParam {
    value = 0;
    setValueAtTime() { return this; }
    linearRampToValueAtTime() { return this; }
    exponentialRampToValueAtTime() { return this; }
    setTargetAtTime() { return this; }
    cancelScheduledValues() { return this; }
}

class FakeAudioNode {
    gain = new FakeAudioParam();
    frequency = new FakeAudioParam();
    detune = new FakeAudioParam();
    Q = new FakeAudioParam();
    delayTime = new FakeAudioParam();
    playbackRate = new FakeAudioParam();
    threshold = new FakeAudioParam();
    knee = new FakeAudioParam();
    ratio = new FakeAudioParam();
    attack = new FakeAudioParam();
    release = new FakeAudioParam();

    type = "sine";
    oversample = "none";
    buffer: any = null;
    curve: any = null;
    loop = false;
    fftSize = 2048;
    frequencyBinCount = 1024;
    minDecibels = -100;
    maxDecibels = -30;
    smoothingTimeConstant = 0.8;
    reduction = 0;
    numberOfInputs = 1;
    numberOfOutputs = 1;

    onaudioprocess: any = null;
    onended: any = null;
    onmessage: any = null;
    oncomplete: any = null;

    connect() { return this; }
    disconnect() { }
    start() { }
    stop() { }
    getByteFrequencyData(data: any) { this.fill(data); }
    getFloatFrequencyData(data: any) { this.fill(data); }
    getByteTimeDomainData(data: any) { this.fill(data); }
    getFloatTimeDomainData(data: any) { this.fill(data); }
    private fill(data: any) { if (data && typeof data.fill === "function") data.fill(0); }
}

class FakeAudioContext {
    sampleRate = 44100;
    currentTime = 0;
    state = "running";
    destination = new FakeAudioNode();

    createGain() { return new FakeAudioNode(); }
    createOscillator() { return new FakeAudioNode(); }
    createBiquadFilter() { return new FakeAudioNode(); }
    createConvolver() { return new FakeAudioNode(); }
    createAnalyser() { return new FakeAudioNode(); }
    createDynamicsCompressor() { return new FakeAudioNode(); }
    createWaveShaper() { return new FakeAudioNode(); }
    createBufferSource() { return new FakeAudioNode(); }
    createMediaStreamSource() { return new FakeAudioNode(); }
    createScriptProcessor() { return new FakeAudioNode(); }
    createDelay() { return new FakeAudioNode(); }
    createBuffer(channels: number, length: number, sampleRate: number) {
        return {
            numberOfChannels: channels,
            length,
            sampleRate,
            getChannelData: () => new Float32Array(length),
        };
    }
    decodeAudioData() { return Promise.resolve({}); }
    suspend() { return Promise.resolve(); }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
}

const audioContext = FakeAudioContext as any;
(globalThis as any).AudioContext = audioContext;
(globalThis as any).webkitAudioContext = audioContext;
if (typeof window !== "undefined") {
    (window as any).AudioContext = audioContext;
    (window as any).webkitAudioContext = audioContext;
}
