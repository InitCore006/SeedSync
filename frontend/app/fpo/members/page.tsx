'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useFPOMembers } from '@/lib/hooks/useAPI';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { UserPlus, Search, Phone, Mail, Calendar, Eye, Trash2 } from 'lucide-react';
import { API } from '@/lib/api';
import toast from 'react-hot-toast';
import { CROPS, INDIAN_STATES } from '@/lib/constants';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [isLoading, setIsLoading] = useState(false);
  
  // Existing farmer form
  const [existingFormData, setExistingFormData] = useState({
    phone_number: '',
  });
  
  // New farmer form
  const [newFormData, setNewFormData] = useState({
    phone_number: '',
    full_name: '',
    father_name: '',
    total_land_acres: '',
    district: '',
    state: '',
    pincode: '',
    village: '',
    primary_crops: [] as string[],
  });

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.fpo.addMember(existingFormData.phone_number);
      toast.success('Member added successfully');
      onAdd();
      onClose();
      setExistingFormData({ phone_number: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await API.fpo.createFarmer({
        phone_number: newFormData.phone_number,
        full_name: newFormData.full_name,
        father_name: newFormData.father_name,
        total_land_acres: parseFloat(newFormData.total_land_acres),
        district: newFormData.district,
        state: newFormData.state,
        pincode: newFormData.pincode,
        village: newFormData.village,
        primary_crops: newFormData.primary_crops,
      });
      
      const data = response.data;
      toast.success(
        `Farmer registered successfully!\nMembership No: ${data.membership_number}`,
        { duration: 4000 }
      );
      
      onAdd();
      onClose();
      setNewFormData({
        phone_number: '',
        full_name: '',
        father_name: '',
        total_land_acres: '',
        district: '',
        state: '',
        pincode: '',
        village: '',
        primary_crops: [],
        share_capital: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create farmer account');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCrop = (crop: string) => {
    setNewFormData(prev => ({
      ...prev,
      primary_crops: prev.primary_crops.includes(crop)
        ? prev.primary_crops.filter(c => c !== crop)
        : [...prev.primary_crops, crop]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member" size="lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'existing'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('existing')}
        >
          Existing Farmer
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'new'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('new')}
        >
          Create New Farmer
        </button>
      </div>

      {/* Existing Farmer Form */}
      {activeTab === 'existing' && (
        <form onSubmit={handleExistingSubmit} className="space-y-4">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
            Add an already registered farmer to your FPO membership
          </div>
          
          <Input
            label="Farmer Phone Number"
            placeholder="Enter 10-digit phone number"
            required
            value={existingFormData.phone_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setExistingFormData({ ...existingFormData, phone_number: value });
            }}
            maxLength={10}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
              Add Member
            </Button>
          </div>
        </form>
      )}

      {/* New Farmer Form */}
      {activeTab === 'new' && (
        <form onSubmit={handleNewSubmit} className="space-y-4">
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
            Create a new farmer account and add them to your FPO. They will receive an OTP to activate their account.
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Farmer's full name"
              required
              value={newFormData.full_name}
              onChange={(e) => setNewFormData({ ...newFormData, full_name: e.target.value })}
            />
            
            <Input
              label="Father's Name"
              placeholder="Father's name (optional)"
              value={newFormData.father_name}
              onChange={(e) => setNewFormData({ ...newFormData, father_name: e.target.value })}
            />
          </div>
          
          <Input
            label="Phone Number"
            type="tel"
            placeholder="10-digit mobile number (e.g., 9876543210)"
            required
            maxLength={10}
            value={newFormData.phone_number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setNewFormData({ ...newFormData, phone_number: value });
            }}
          />
          
          <Input
            label="Total Land (Acres)"
            type="number"
            step="0.01"
            placeholder="Enter total land area"
            required
            value={newFormData.total_land_acres}
            onChange={(e) => setNewFormData({ ...newFormData, total_land_acres: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Crops *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CROPS.map((crop) => (
                <label key={crop.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFormData.primary_crops.includes(crop.value)}
                    onChange={() => toggleCrop(crop.value)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{crop.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Village"
              placeholder="Village name (optional)"
              value={newFormData.village}
              onChange={(e) => setNewFormData({ ...newFormData, village: e.target.value })}
            />
            
            <Input
              label="District"
              placeholder="District"
              required
              value={newFormData.district}
              onChange={(e) => setNewFormData({ ...newFormData, district: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="State"
              required
              value={newFormData.state}
              onChange={(e) => setNewFormData({ ...newFormData, state: e.target.value })}
              options={[
                { value: '', label: 'Select State' },
                ...INDIAN_STATES.map(state => ({ value: state, label: state }))
              ]}
            />
            
            <Input
              label="Pincode"
              placeholder="6-digit pincode"
              required
              maxLength={6}
              value={newFormData.pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setNewFormData({ ...newFormData, pincode: value });
              }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
              Create Farmer Account
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function FPOMembersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const { members, isLoading, isError, mutate } = useFPOMembers();

  const handleRefresh = () => {
    mutate(); // Refresh the list
  };
  
  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };
  
  const handleRemoveClick = (member: any) => {
    setMemberToRemove(member);
    setIsRemoveModalOpen(true);
  };
  
  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    
    try {
      await API.fpo.removeMember(memberToRemove.id);
      toast.success('Member removed successfully');
      setIsRemoveModalOpen(false);
      setMemberToRemove(null);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (isLoading) return <Loading fullScreen />;
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load members data
        </div>
      </div>
    );
  }

  const filteredMembers = members?.filter((member: any) =>
    member.farmer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.farmer?.phone_number?.includes(searchQuery)
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FPO Members</h1>
          <p className="text-gray-600 mt-1">Manage your farmer members</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{members?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Active Members</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {members?.filter((m: any) => m.is_active).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Founding Members</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {members?.filter((m: any) => m.is_founding_member).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">New This Month</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {members?.filter((m: any) => {
                const joinedDate = new Date(m.joined_date);
                const now = new Date();
                return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members List ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(member.farmer?.full_name || 'NA')}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{member.farmer?.full_name}</h3>
                      <Badge variant="status" status={member.is_active ? 'active' : 'inactive'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{member.farmer?.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(member.joined_date, 'PP')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProfile(member)}
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveClick(member)}
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start building your FPO by adding farmer members'}
              </p>
              {!searchQuery && (
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleRefresh}
      />
      
      {/* View Profile Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Farmer Profile"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{selectedMember.farmer?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{selectedMember.farmer?.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Father&apos;s Name</p>
                <p className="font-medium">{selectedMember.farmer?.father_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membership Number</p>
                <p className="font-medium">{selectedMember.membership_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Land (acres)</p>
                <p className="font-medium">{selectedMember.farmer?.total_land_acres || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">District</p>
                <p className="font-medium">{selectedMember.farmer?.district}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium">{selectedMember.farmer?.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pincode</p>
                <p className="font-medium">{selectedMember.farmer?.pincode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Village</p>
                <p className="font-medium">{selectedMember.farmer?.village || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined Date</p>
                <p className="font-medium">{formatDate(selectedMember.joined_date, 'PP')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="status" status={selectedMember.is_active ? 'active' : 'inactive'}>
                  {selectedMember.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            {selectedMember.farmer?.primary_crops && selectedMember.farmer.primary_crops.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Primary Crops</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.farmer.primary_crops.map((crop: string) => (
                    <Badge key={crop} variant="secondary">{crop}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Member"
      >
        {memberToRemove && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{memberToRemove.farmer?.full_name}</strong> from your FPO?
            </p>
            <p className="text-sm text-gray-600">
              This will deactivate their membership. They will no longer be counted as an active member.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setIsRemoveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleRemoveConfirm}
              >
                Remove Member
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function FPOMembersPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <FPOMembersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
