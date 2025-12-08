# Speech-to-Text Setup Guide

This guide explains how to set up speech recognition for the Farming Assistant.

## Option 1: OpenAI Whisper API (Recommended) ✅

**Why Whisper?**
- Best multilingual support (Hindi, English, and 90+ languages)
- High accuracy for accented speech
- No need for language specification
- Simple integration

### Setup Steps:

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

2. **Update the API Key:**
   - Open `mobile/services/speechService.ts`
   - Replace `YOUR_OPENAI_API_KEY` with your actual key:
     ```typescript
     const OPENAI_API_KEY = 'sk-proj-xxxxxxxxxxxxxxxxxxxxx';
     ```

3. **Install Dependencies:**
   ```bash
   cd mobile
   npx expo install expo-av expo-file-system
   ```

4. **Test:**
   - Run the app
   - Click the microphone icon
   - Speak in Hindi or English
   - The speech will be converted to text automatically

### Pricing:
- $0.006 per minute of audio
- Very affordable for farming app usage
- Pay-as-you-go model

---

## Option 2: Google Cloud Speech-to-Text

**Setup Steps:**

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable "Cloud Speech-to-Text API"

2. **Get API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Create credentials > API Key
   - Copy the API key

3. **Update the API Key:**
   - Open `mobile/services/speechService.ts`
   - Replace `YOUR_GOOGLE_CLOUD_API_KEY` with your key:
     ```typescript
     const GOOGLE_CLOUD_API_KEY = 'AIzaSyxxxxxxxxxxxxxxxxxxxxx';
     ```

4. **Change Default Service:**
   - In `speechService.ts`, update the `convertSpeechToText` call:
     ```typescript
     // Use Google instead of Whisper
     const result = await speechService.convertSpeechToText(audioUri, false);
     ```

### Pricing:
- Free tier: 60 minutes/month
- $0.006 per 15 seconds after free tier

---

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "expo-av": "~13.10.4",
    "expo-file-system": "~16.0.6",
    "axios": "^1.6.0"
  }
}
```

Install with:
```bash
cd mobile
npx expo install expo-av expo-file-system
npm install axios
```

---

## Permissions Setup

### iOS (Info.plist)
Already configured in Expo, but if using bare React Native:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone to record your farming questions</string>
```

### Android (AndroidManifest.xml)
Already configured in Expo, but if using bare React Native:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## Usage in Code

The implementation is already complete in `farming-assistant.tsx`. Here's what happens:

1. **User taps microphone button** → Requests permission
2. **Recording starts** → Records high-quality audio
3. **User taps stop** → Stops recording
4. **Processing** → Converts speech to text using Whisper/Google API
5. **Language detection** → Automatically detects Hindi/English
6. **AI response** → Gemini responds in the same language

---

## Testing

1. **Test Hindi:**
   - Say: "मेरी फसल में कीड़े लग गए हैं, क्या करूं?"
   - Expected: Text appears in Hindi, AI responds in Hindi

2. **Test English:**
   - Say: "How do I improve soil quality?"
   - Expected: Text appears in English, AI responds in English

3. **Test Mixed:**
   - Say: "Meri wheat crop ko kitna pani chahiye?"
   - Expected: AI responds in both languages

---

## Troubleshooting

### Issue: "Microphone permission not granted"
**Solution:** 
- iOS: Settings > Your App > Allow Microphone
- Android: Settings > Apps > Your App > Permissions > Microphone

### Issue: "Failed to convert speech to text"
**Solution:**
- Check API key is correct
- Verify API is enabled in Google Cloud Console
- Check internet connection
- Verify billing is enabled for Google Cloud

### Issue: Poor recognition quality
**Solution:**
- Use Whisper API (better for accented speech)
- Record in quiet environment
- Speak clearly and slowly
- Hold phone closer to mouth

### Issue: "No transcription results"
**Solution:**
- Audio file might be too short (speak for at least 1-2 seconds)
- Check audio encoding settings
- Try using Whisper instead of Google

---

## Cost Optimization

1. **Limit recording duration:**
   - Max 60 seconds per recording
   - Prevents accidental long recordings

2. **Cache common questions:**
   - Store frequently asked questions
   - Reduce API calls

3. **Use free tier efficiently:**
   - Google: 60 mins/month free
   - Whisper: Pay per use (very affordable)

---

## Production Recommendations

1. **Use Whisper API** for best multilingual support
2. **Add rate limiting** to prevent abuse
3. **Implement retry logic** for failed API calls
4. **Store audio files temporarily** and cleanup after processing
5. **Add analytics** to track usage and costs
6. **Implement fallback** to text input if speech fails

---

## Environment Variables (Recommended)

Instead of hardcoding API keys, use environment variables:

1. Create `.env` file in mobile folder:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLOUD_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
```

2. Install dotenv:
```bash
npm install react-native-dotenv
```

3. Update speechService.ts:
```typescript
import { OPENAI_API_KEY, GOOGLE_CLOUD_API_KEY } from '@env';
```

This keeps keys secure and separate from code.
