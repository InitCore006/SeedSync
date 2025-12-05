'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useFPOMembers } from '@/lib/hooks/useAPI';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { UserPlus, Search, Phone, Mail, Calendar, IndianRupee, Edit, Trash2 } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    share_capital: '',
    land_area_acres: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Call API to add member
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAdd(formData);
    setIsLoading(false);
    onClose();
    setFormData({
      full_name: '',
      phone_number: '',
      email: '',
      share_capital: '',
      land_area_acres: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter member name"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        
        <Input
          label="Phone Number"
          type="tel"
          placeholder="10-digit mobile number"
          required
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
        />
        
        <Input
          label="Email (Optional)"
          type="email"
          placeholder="member@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        
        <Input
          label="Share Capital (₹)"
          type="number"
          placeholder="Enter share amount"
          required
          value={formData.share_capital}
          onChange={(e) => setFormData({ ...formData, share_capital: e.target.value })}
        />
        
        <Input
          label="Land Area (Acres)"
          type="number"
          step="0.01"
          placeholder="Enter land area"
          value={formData.land_area_acres}
          onChange={(e) => setFormData({ ...formData, land_area_acres: e.target.value })}
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
    </Modal>
  );
}

function FPOMembersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { members, isLoading, isError, mutate } = useFPOMembers();

  const handleAddMember = (data: any) => {
    console.log('Adding member:', data);
    mutate(); // Refresh the list
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
            <p className="text-sm font-medium text-gray-600">Total Share Capital</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(members?.reduce((sum: number, m: any) => sum + (m.share_capital || 0), 0) || 0)}
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
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>Share: {formatCurrency(member.share_capital || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
        onAdd={handleAddMember}
      />
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
