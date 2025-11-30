import { useCallback } from 'react';
import { useAIStore } from '@/store/aiStore';

export const useAI = () => {
  const store = useAIStore();

  // Crop Scanner
  const analyzeCrop = useCallback(
    async (imageUri: string, cropName?: string) => {
      await store.analyzeCropImage(imageUri, cropName);
    },
    [store]
  );

  const getScanHistory = useCallback(async () => {
    await store.fetchScanHistory();
  }, [store]);

  const getScanDetails = useCallback(
    async (scanId: string) => {
      await store.fetchScanById(scanId);
    },
    [store]
  );

  // Crop Planner
  const createCropPlan = useCallback(
    async (params: any) => {
      await store.generateCropPlan(params);
    },
    [store]
  );

  const getCropPlans = useCallback(async () => {
    await store.fetchCropPlans();
  }, [store]);

  // Price Prediction
  const getPriceForecast = useCallback(
    async (cropName: string, market?: string) => {
      await store.fetchPricePrediction(cropName, market);
    },
    [store]
  );

  const getAllPrices = useCallback(async () => {
    await store.fetchAllPricePredictions();
  }, [store]);

  // Yield Prediction
  const getYieldForecast = useCallback(
    async (cropId: string) => {
      await store.fetchYieldPrediction(cropId);
    },
    [store]
  );

  const getAllYields = useCallback(async () => {
    await store.fetchAllYieldPredictions();
  }, [store]);

  // Chatbot
  const sendChatMessage = useCallback(
    async (sessionId: string, message: string, attachments?: any[]) => {
      await store.sendMessage(sessionId, message, attachments);
    },
    [store]
  );

  const loadChatHistory = useCallback(async () => {
    await store.fetchChatSessions();
  }, [store]);

  const loadSession = useCallback(
    async (sessionId: string) => {
      await store.fetchChatSession(sessionId);
    },
    [store]
  );

  const startNewChat = useCallback(
    async (title: string) => {
      await store.createChatSession(title);
    },
    [store]
  );

  // Alerts
  const loadAlerts = useCallback(async () => {
    await store.fetchAIAlerts();
  }, [store]);

  const readAlert = useCallback(
    async (alertId: string) => {
      await store.markAlertAsRead(alertId);
    },
    [store]
  );

  const removeAlert = useCallback(
    async (alertId: string) => {
      await store.dismissAlert(alertId);
    },
    [store]
  );

  return {
    // State
    scanResults: store.scanResults,
    currentScan: store.currentScan,
    isScanning: store.isScanning,
    cropPlans: store.cropPlans,
    currentPlan: store.currentPlan,
    pricePredictions: store.pricePredictions,
    currentPricePrediction: store.currentPricePrediction,
    yieldPredictions: store.yieldPredictions,
    currentYieldPrediction: store.currentYieldPrediction,
    chatSessions: store.chatSessions,
    currentSession: store.currentSession,
    isSendingMessage: store.isSendingMessage,
    aiAlerts: store.aiAlerts,
    unreadAlertCount: store.unreadAlertCount,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    analyzeCrop,
    getScanHistory,
    getScanDetails,
    clearCurrentScan: store.clearCurrentScan,
    createCropPlan,
    getCropPlans,
    setCurrentPlan: store.setCurrentPlan,
    getPriceForecast,
    getAllPrices,
    getYieldForecast,
    getAllYields,
    sendChatMessage,
    loadChatHistory,
    loadSession,
    startNewChat,
    setCurrentSession: store.setCurrentSession,
    loadAlerts,
    readAlert,
    removeAlert,
    clearError: store.clearError,
    reset: store.reset,
  };
};