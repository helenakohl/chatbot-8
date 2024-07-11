import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({ onResult, onError }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  useEffect(() => {
    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
          console.log('Data available:', event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log('Recording stopped');
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          console.log('Audio blob created:', audioBlob);

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);

          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            console.log('Base64 audio:', base64Audio);

            if (!base64Audio) {
              onError?.('Failed to convert audio to base64');
              return;
            }

            try {
              const response = await fetch('/.netlify/functions/stt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioContent: base64Audio }),
              });

              if (!response.ok) {
                throw new Error('Server responded with an error');
              }

              const data = await response.json();
              console.log('Server response:', data);

              if (data.transcription) {
                onResult(data.transcription);
              } else {
                onError?.('Transcription not found in response');
              }
            } catch (error: any) {
              console.error('Error in fetch:', error);
              onError?.(`Error in speech recognition: ${error.message}`);
            }
          };
        };

        mediaRecorder.start();
        console.log('Media recorder started');
      } catch (error: any) {
        console.error('Error accessing microphone:', error);
        onError?.(`Error accessing microphone: ${error.message}`);
      }
    };

    if (isListening) {
      startRecording();
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [isListening, onResult, onError]);

  return {
    isListening,
    startListening,
    stopListening,
  };
}
