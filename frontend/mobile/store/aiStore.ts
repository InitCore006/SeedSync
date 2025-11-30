import { create } from 'zustand';
import {
  ScanResult,
  CropPlan,
  PricePrediction,
  YieldPrediction,
  ChatSession,
  ChatMessage,
  AIAlert,
} from '@/types/ai.types';
import { aiService } from '@/services/ai.service';

interface AIStore {
  // State - Crop Scanner
  scanResults: ScanResult[];
  currentScan: ScanResult | null;
  isScanning: boolean;

  // State - Crop Planner
  cropPlans: CropPlan[];
  currentPlan: CropPlan | null;

  // State - Price Prediction
  pricePredictions: PricePrediction[];
  currentPricePrediction: PricePrediction | null;

  // State - Yield Prediction
  yieldPredictions: YieldPrediction[];
  currentYieldPrediction: YieldPrediction | null;

  // State - Chatbot
  chatSessions: ChatSession[];
  currentSession: ChatSession | null;
  isSendingMessage: boolean;

  // State - Alerts
  aiAlerts: AIAlert[];
  unreadAlertCount: number;

  // Common State
  isLoading: boolean;
  error: string | null;

  // Actions - Crop Scanner
  analyzeCropImage: (imageUri: string, cropName?: string) => Promise<void>;
  fetchScanHistory: () => Promise<void>;
  fetchScanById: (scanId: string) => Promise<void>;
  clearCurrentScan: () => void;

  // Actions - Crop Planner
  generateCropPlan: (params: any) => Promise<void>;
  fetchCropPlans: () => Promise<void>;
  setCurrentPlan: (plan: CropPlan | null) => void;

  // Actions - Price Prediction
  fetchPricePrediction: (cropName: string, market?: string) => Promise<void>;
  fetchAllPricePredictions: () => Promise<void>;

  // Actions - Yield Prediction
  fetchYieldPrediction: (cropId: string) => Promise<void>;
  fetchAllYieldPredictions: () => Promise<void>;

  // Actions - Chatbot
  sendMessage: (sessionId: string, message: string, attachments?: any[]) => Promise<void>;
  fetchChatSessions: () => Promise<void>;
  fetchChatSession: (sessionId: string) => Promise<void>;
  createChatSession: (title: string) => Promise<void>;
  setCurrentSession: (session: ChatSession | null) => void;

  // Actions - Alerts
  fetchAIAlerts: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;

  // Common Actions
  clearError: () => void;
  reset: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial State
  scanResults: [],
  currentScan: null,
  isScanning: false,
  cropPlans: [] as CropPlan[],
  currentPlan: null,
  pricePredictions: [],
  currentPricePrediction: null,
  yieldPredictions: [],
  currentYieldPrediction: null,
  chatSessions: [],
  currentSession: null,
  isSendingMessage: false,
  aiAlerts: [],
  unreadAlertCount: 0,
  isLoading: false,
  error: null,
  

  // Crop Scanner Actions
  analyzeCropImage: async (imageUri: string, cropName?: string) => {
    set({ isScanning: true, error: null });
    try {
      const result = await aiService.analyzeCropImage(imageUri, cropName);
      set((state) => ({
        scanResults: [result, ...state.scanResults],
        currentScan: result,
        isScanning: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isScanning: false });
    }
  },

  fetchScanHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await aiService.getScanHistory();
      set({ scanResults: results, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchScanById: async (scanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const scan = await aiService.getScanById(scanId);
      set({ currentScan: scan, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCurrentScan: () => {
    set({ currentScan: null });
  },

  // Crop Planner Actions
  generateCropPlan: async (params: any) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await aiService.generateCropPlan(params);
      set((state) => ({
        cropPlans: [plan, ...state.cropPlans],
        currentPlan: plan,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },



  getPlanDetails: async (planId: string) => {
    set({ isLoading: true });
    try {
      const plan = get().cropPlans.find(p => p.id === planId);
      set({ currentPlan: plan || null });
    } catch (error) {
      console.error('Failed to fetch plan details:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlan: async (planId: string) => {
    set({ isLoading: true });
    try {
      const plans = get().cropPlans.filter(p => p.id !== planId);
      set({ cropPlans: plans });
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCropPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const plans = await aiService.getCropPlans();
      set({ cropPlans: plans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setCurrentPlan: (plan: CropPlan | null) => {
    set({ currentPlan: plan });
  },

  // Price Prediction Actions
  fetchPricePrediction: async (cropName: string, market?: string) => {
    set({ isLoading: true, error: null });
    try {
      const prediction = await aiService.getPricePrediction(cropName, market);
      set({ currentPricePrediction: prediction, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAllPricePredictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const predictions = await aiService.getAllPricePredictions();
      set({ pricePredictions: predictions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Yield Prediction Actions
  fetchYieldPrediction: async (cropId: string) => {
    set({ isLoading: true, error: null });
    try {
      const prediction = await aiService.getYieldPrediction(cropId);
      set({ currentYieldPrediction: prediction, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAllYieldPredictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const predictions = await aiService.getAllYieldPredictions();
      set({ yieldPredictions: predictions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Chatbot Actions
  sendMessage: async (sessionId: string, message: string, attachments?: any[]) => {
    set({ isSendingMessage: true, error: null });
    try {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        attachments,
      };

      set((state) => {
        const session = state.currentSession;
        if (session) {
          session.messages = [...session.messages, userMessage];
        }
        return { currentSession: session };
      });

      const response = await aiService.sendChatMessage(sessionId, message, attachments);

      set((state) => {
        const session = state.currentSession;
        if (session) {
          session.messages = [...session.messages, response];
          session.updatedAt = new Date().toISOString();
        }
        return { currentSession: session, isSendingMessage: false };
      });
    } catch (error: any) {
      set({ error: error.message, isSendingMessage: false });
    }
  },

  fetchChatSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await aiService.getChatSessions();
      set({ chatSessions: sessions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchChatSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await aiService.getChatSession(sessionId);
      set({ currentSession: session, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createChatSession: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await aiService.createChatSession(title);
      set((state) => ({
        chatSessions: [session, ...state.chatSessions],
        currentSession: session,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setCurrentSession: (session: ChatSession | null) => {
    set({ currentSession: session });
  },

  // AI Alerts Actions
  fetchAIAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await aiService.getAIAlerts();
      const unreadCount = alerts.filter((a) => !a.isRead).length;
      set({ aiAlerts: alerts, unreadAlertCount: unreadCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAlertAsRead: async (alertId: string) => {
    try {
      await aiService.markAlertAsRead(alertId);
      set((state) => ({
        aiAlerts: state.aiAlerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
        unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  dismissAlert: async (alertId: string) => {
    try {
      await aiService.dismissAlert(alertId);
      set((state) => {
        const alert = state.aiAlerts.find((a) => a.id === alertId);
        return {
          aiAlerts: state.aiAlerts.filter((a) => a.id !== alertId),
          unreadAlertCount: alert && !alert.isRead ? state.unreadAlertCount - 1 : state.unreadAlertCount,
        };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Common Actions
  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      scanResults: [],
      currentScan: null,
      isScanning: false,
      cropPlans: [],
      currentPlan: null,
      pricePredictions: [],
      currentPricePrediction: null,
      yieldPredictions: [],
      currentYieldPrediction: null,
      chatSessions: [],
      currentSession: null,
      isSendingMessage: false,
      aiAlerts: [],
      unreadAlertCount: 0,
      isLoading: false,
      error: null,
    });
  },
}));