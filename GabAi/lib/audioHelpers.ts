export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Extract the base64 string without the data URL prefix
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getSupportedMimeType = (): string => {
  const types = [
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav"
  ];
  
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return ""; // Fallback to browser default
};

export const createAudioVisualizer = (
  stream: MediaStream, 
  onVolumeChange: (volume: number) => void
) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  
  analyser.fftSize = 256;
  source.connect(analyser);
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let animationFrameId: number;
  
  const updateVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    
    // Normalize to 0-100 scale
    // Multiplied by a factor to make it more sensitive
    const normalizedVolume = Math.min(100, Math.round((average / 255) * 100 * 1.5));
    onVolumeChange(normalizedVolume);
    
    animationFrameId = requestAnimationFrame(updateVolume);
  };
  
  updateVolume();
  
  return () => {
    cancelAnimationFrame(animationFrameId);
    source.disconnect();
    analyser.disconnect();
    if (audioContext.state !== 'closed') {
      audioContext.close();
    }
  };
};
