export const AI_PROMPTS = {
  cropScanner: {
    diseaseDetection: 'Analyze this crop image and identify any diseases, pests, or nutrient deficiencies. Provide detailed recommendations.',
    healthCheck: 'Assess the overall health of this crop and provide a health score with detailed analysis.',
    growthStage: 'Identify the current growth stage of this crop and suggest optimal care practices.',
  },
  cropPlanner: {
    recommend: 'Based on soil type, climate, and season, recommend the best crops to grow with expected yield and profitability.',
    rotation: 'Suggest an optimal crop rotation plan for sustainable farming and soil health.',
    calendar: 'Generate a complete farming calendar with sowing, fertilization, and harvest dates.',
  },
  pricePrediction: {
    forecast: 'Predict market prices for the next 30, 60, and 90 days based on historical data and market trends.',
    bestTime: 'Analyze the best time to sell crops for maximum profit.',
    comparison: 'Compare current prices with historical averages and seasonal patterns.',
  },
  yieldPrediction: {
    estimate: 'Estimate expected yield based on crop variety, soil conditions, weather, and farming practices.',
    optimization: 'Suggest practices to maximize yield and quality.',
    riskFactors: 'Identify potential risks that could affect yield.',
  },
  chatbot: {
    greeting: 'Hello! I am your AI farming assistant. How can I help you today?',
    farming: 'Ask me anything about crop cultivation, pest management, soil health, or farming techniques.',
    weather: 'I can provide weather-based farming advice and recommendations.',
  },
};

export const AI_CONFIDENCE_LEVELS = {
  high: { min: 85, label: 'High Confidence', color: '#10B981' },
  medium: { min: 60, label: 'Medium Confidence', color: '#F59E0B' },
  low: { min: 0, label: 'Low Confidence', color: '#EF4444' },
};

export const DISEASE_CATEGORIES = [
  { id: 'fungal', label: 'Fungal Disease', icon: '🍄' },
  { id: 'bacterial', label: 'Bacterial Disease', icon: '🦠' },
  { id: 'viral', label: 'Viral Disease', icon: '🧬' },
  { id: 'pest', label: 'Pest Infestation', icon: '🐛' },
  { id: 'nutrient', label: 'Nutrient Deficiency', icon: '🧪' },
  { id: 'environmental', label: 'Environmental Stress', icon: '🌡️' },
];

export const TREATMENT_TYPES = [
  { id: 'organic', label: 'Organic Treatment' },
  { id: 'chemical', label: 'Chemical Treatment' },
  { id: 'biological', label: 'Biological Control' },
  { id: 'cultural', label: 'Cultural Practices' },
];