import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// Google Cloud Speech-to-Text API configuration
const GOOGLE_CLOUD_API_KEY = 'AIzaSyA660rRPodp-UM85PSK6g2ELcQOiJMKFX0'; 
const SPEECH_TO_TEXT_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`;


export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
}

class SpeechService {
  private recording: Audio.Recording | null = null;
  private recordingUri: string | null = null;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      this.recordingUri = uri;
      this.recording = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('Recording cancelled');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  }

  /**
   * Convert speech to text using Google Cloud Speech-to-Text API
   */
  async speechToTextGoogle(audioUri: string, languageCode: string = 'en-IN'): Promise<SpeechRecognitionResult> {
    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare request payload
      const requestBody = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
          languageCode: languageCode, // 'en-IN' for English (India), 'hi-IN' for Hindi
          alternativeLanguageCodes: ['en-IN', 'hi-IN'], // Support both languages
          enableAutomaticPunctuation: true,
          model: 'default',
        },
        audio: {
          content: audioBase64,
        },
      };

      // Send request to Google Cloud Speech-to-Text
      const response = await axios.post(SPEECH_TO_TEXT_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Extract transcript
      const result = response.data.results?.[0];
      if (!result || !result.alternatives?.[0]) {
        throw new Error('No transcription results');
      }

      const alternative = result.alternatives[0];
      const detectedLanguage = result.languageCode || languageCode;

      return {
        transcript: alternative.transcript,
        confidence: alternative.confidence || 0,
        language: detectedLanguage,
      };
    } catch (error: any) {
      console.error('Speech-to-text error:', error.response?.data || error.message);
      throw new Error('Failed to convert speech to text');
    }
  }

  /**
   * Convert speech to text using OpenAI Whisper API (recommended for better multilingual support)
   */
  async speechToTextWhisper(audioUri: string): Promise<SpeechRecognitionResult> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Append audio file
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any;
      
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', 'hi'); // Auto-detects but hint for Hindi/English
      formData.append('response_format', 'json');

      // Send request to OpenAI Whisper
      const response = await axios.post(WHISPER_URL, formData, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        transcript: response.data.text,
        confidence: 0.95, // Whisper doesn't return confidence, assume high
        language: response.data.language || 'en',
      };
    } catch (error: any) {
      console.error('Whisper API error:', error.response?.data || error.message);
      throw new Error('Failed to convert speech to text');
    }
  }

  /**
   * Main method to convert speech to text (uses Whisper by default for better multilingual support)
   */
  async convertSpeechToText(audioUri: string, useWhisper: boolean = true): Promise<SpeechRecognitionResult> {
    if (useWhisper) {
      return this.speechToTextWhisper(audioUri);
    } else {
      return this.speechToTextGoogle(audioUri, 'hi-IN'); // Default to Hindi
    }
  }

  /**
   * Detect language from text (simple heuristic)
   */
  detectLanguage(text: string): 'hindi' | 'english' | 'mixed' {
    const hindiPattern = /[\u0900-\u097F]/;
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);

    if (hasHindi && hasEnglish) return 'mixed';
    if (hasHindi) return 'hindi';
    return 'english';
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.recordingUri) {
      try {
        await FileSystem.deleteAsync(this.recordingUri, { idempotent: true });
        this.recordingUri = null;
      } catch (error) {
        console.error('Failed to cleanup recording:', error);
      }
    }
  }
}

export const speechService = new SpeechService();
