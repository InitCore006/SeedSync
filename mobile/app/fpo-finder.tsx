import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, Loading } from '@/components';
import { farmersAPI } from '@/services/farmersService';
import { FPOProfile } from '@/types/api';

export default function NearbyFPOsScreen() {
  const [fpos, setFpos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedFPO, setSelectedFPO] = useState<any>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchNearbyFPOs = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to find nearby FPOs. Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get current device location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      const response = await farmersAPI.getNearbyFPOs({
        latitude,
        longitude,
      });
      
      // Handle response structure: response.data.data contains the FPO array
      const fpoData = response.data?.data || response.data || [];
      setFpos(Array.isArray(fpoData) ? fpoData : []);
    } catch (error: any) {
      console.error('Failed to load nearby FPOs:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to get location or load nearby FPOs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNearbyFPOs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearbyFPOs();
  };

  const handleJoinRequest = (fpo: any) => {
    setSelectedFPO(fpo);
    setJoinMessage('');
    setModalVisible(true);
  };

  const sendJoinRequest = async () => {
    if (!selectedFPO) return;

    setSending(true);
    try {
      await farmersAPI.sendFPOJoinRequest({
        fpo_id: selectedFPO.id,
        message: joinMessage,
      });
      Alert.alert('Success', `Join request sent to ${selectedFPO.organization_name}`);
      setModalVisible(false);
      fetchNearbyFPOs(); // Refresh to update request status
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send join request');
    } finally {
      setSending(false);
    }
  };

  const renderFPOCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.fpoIcon}>
          <Ionicons name="business" size={28} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.fpoName} numberOfLines={2}>{item.organization_name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={COLORS.text.secondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.district}, {item.state}
            </Text>
          </View>
          <View style={styles.distanceRow}>
            <Ionicons name="navigate" size={14} color="#10b981" />
            <Text style={styles.distanceText}>
              {typeof item.distance === 'number' ? item.distance.toFixed(2) : item.distance} km away
            </Text>
          </View>
        </View>
      </View>

      {item.office_address && (
        <View style={styles.addressContainer}>
          <Ionicons name="home" size={14} color={COLORS.text.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.office_address}
          </Text>
        </View>
      )}

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <View style={styles.detailIconBg}>
            <Ionicons name="people" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.detailText}>{item.total_members || 0} Members</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.detailIconBg}>
            <Ionicons name="calendar" size={16} color={COLORS.secondary} />
          </View>
          <Text style={styles.detailText}>Since {item.year_of_registration}</Text>
        </View>
      </View>

      {item.primary_crops && item.primary_crops.length > 0 && (
        <View style={styles.cropsContainer}>
          <Ionicons name="leaf" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.cropsText} numberOfLines={2}>
            {Array.isArray(item.primary_crops) ? item.primary_crops.join(', ') : item.primary_crops}
          </Text>
        </View>
      )}

      {item.has_membership ? (
        <View style={styles.memberBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
          <Text style={styles.memberText}>You are a member</Text>
        </View>
      ) : item.has_pending_request ? (
        <View style={styles.pendingBadge}>
          <Ionicons name="time" size={18} color="#f59e0b" />
          <Text style={styles.pendingText}>Request Pending</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinRequest(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.joinButtonText}>Send Join Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader title="Nearby FPOs" onMenuPress={() => setSidebarVisible(true)} />
        <Loading fullScreen />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Nearby FPOs" onMenuPress={() => setSidebarVisible(true)} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Info Banner */}
      {!loading && fpos.length > 0 && (
        <View style={styles.infoBanner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="information-circle" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.bannerText}>
            Found {fpos.length} FPO{fpos.length !== 1 ? 's' : ''} within 100 km of your location
          </Text>
        </View>
      )}

      <FlatList
        data={fpos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFPOCard}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="business-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyText}>No FPOs Found</Text>
            <Text style={styles.emptySubtext}>
              No Farmer Producer Organizations found within 100 km of your current location
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={18} color={COLORS.white} />
              <Text style={styles.emptyButtonText}>Refresh Location</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Join Request Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Join Request</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {selectedFPO && (
              <View style={styles.modalFPOInfo}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="business" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalFPOName} numberOfLines={2}>{selectedFPO.organization_name}</Text>
                  <Text style={styles.modalFPOLocation}>
                    {selectedFPO.district}, {selectedFPO.state}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              value={joinMessage}
              onChangeText={setJoinMessage}
              placeholder="Introduce yourself and explain why you want to join this FPO..."
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{joinMessage.length}/500</Text>

            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={sendJoinRequest}
              disabled={sending}
            >
              {sending ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                  <Text style={styles.sendButtonText}>Send Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fpoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  fpoName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 5,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  distanceText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 5,
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  cropsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  cropsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10b98115',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  memberText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f59e0b15',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 450,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  modalFPOInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFPOName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  modalFPOLocation: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  messageInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
