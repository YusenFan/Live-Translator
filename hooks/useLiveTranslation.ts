import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration, LiveServerMessage } from '@google/genai';
import { TranslationStatus, TranslationData, AppConfig } from '../types';
import { MODEL_NAME } from '../constants';
import { createPcmBlob, getAudioContexts } from '../utils/audioUtils';

export function useLiveTranslation(config: AppConfig) {
  const [status, setStatus] = useState<TranslationStatus>(TranslationStatus.IDLE);
  const [translations, setTranslations] = useState<TranslationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Refs to manage non-React state for audio processing and sockets
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Cleanup function to stop audio and close connection
  const disconnect = useCallback(async () => {
    setStatus(TranslationStatus.IDLE);
    
    // Stop mic stream
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    // Close Audio Context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close Session
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      // There isn't an explicit close() on the session object in the type definitions provided in prompt,
      // but typically we stop sending data. The connection is persistent.
      // However, per "Live API Rules", we should use session.close() if available, 
      // but checking the provided examples, we rely on onclose callback.
      // We can force close by just dropping the reference or reloading. 
      // Let's assume a clean disconnect isn't strictly enforced by the client lib aside from closing context.
      // Wait, prompt says: "Use session.close() to close the connection".
      try {
          session.close();
      } catch (e) {
          console.warn("Error closing session", e);
      }
      sessionPromiseRef.current = null;
    }
  }, [mediaStream]);

  const connect = useCallback(async () => {
    try {
      setStatus(TranslationStatus.CONNECTING);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const { inputAudioContext } = await getAudioContexts();
      audioContextRef.current = inputAudioContext;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Define the tool to receive structured text
      const updateTranslationTool: FunctionDeclaration = {
        name: 'update_translation',
        description: 'Update the screen with the latest translation of the user speech.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            lang1_text: { type: Type.STRING, description: `Translation in ${config.lang1}` },
            lang2_text: { type: Type.STRING, description: `Translation in ${config.lang2}` }
          },
          required: ['lang1_text', 'lang2_text']
        }
      };

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setStatus(TranslationStatus.CONNECTED);

            // Start Audio Pipeline
            const source = inputAudioContext.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            // Use ScriptProcessor for raw PCM access (Web Audio API legacy but required for raw chunks easily)
            // Buffer size 4096 provides good balance of latency and performance
            const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(processor);
            processor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls (The Text Output)
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'update_translation') {
                  const args = fc.args as any;
                  const newTranslation: TranslationData = {
                    lang1Text: args.lang1_text || '',
                    lang2Text: args.lang2_text || '',
                    timestamp: Date.now()
                  };
                  
                  setTranslations(prev => [...prev, newTranslation]);

                  // Send tool response to acknowledge
                  sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: 'ok' }
                      }
                    });
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log('Gemini Live Connection Closed');
            setStatus(TranslationStatus.IDLE);
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            setError('Connection error. Please try again.');
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO], // Required by API
          systemInstruction: `You are a professional simultaneous interpreter. 
          Your task is to listen to the user's speech and immediately provide translations in two languages: ${config.lang1} and ${config.lang2}.
          
          Rules:
          1. Listen continuously.
          2. As soon as you have a complete phrase or sentence, call the 'update_translation' tool with the translated text.
          3. Do not speak any audio response yourself. If you must output audio, output silence.
          4. Be accurate and concise.
          5. Do not translate the user's silence or background noise.`,
          tools: [{ functionDeclarations: [updateTranslationTool] }]
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setStatus(TranslationStatus.ERROR);
    }
  }, [config, disconnect]);

  return {
    status,
    translations,
    error,
    mediaStream,
    connect,
    disconnect,
    clearTranslations: () => setTranslations([])
  };
}