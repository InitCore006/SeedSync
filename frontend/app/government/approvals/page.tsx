'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { FileText, Search, Clock, CheckCircle, XCircle, AlertCircle, Users, MapPin, Phone, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock data - replace with API call
const mockApplications = [
  {
    id: 1,
    applicationType: 'FPO Registration',
    applicantName: 'Haryana Oilseed Producers Cooperative',
    registrationNumber: 'APP-FPO-2025-001',
    location: 'Karnal, Haryana',
    contactPerson: 'Suresh Yadav',
    phone: '+91 98765 43220',
    email: 'contact@haryanaops.org',
    members: 320,
    crops: ['Mustard', 'Groundnut', 'Sesame'],
    submittedDate: '2025-11-28',
    priority: 'high',
    status: 'pending',
    documents: ['Registration Certificate', 'Member List', 'Bank Details', 'Land Records'],
  },
  {
    id: 2,
    applicationType: 'FPO Registration',
    applicantName: 'Uttarakhand Hill Farmers Collective',
    registrationNumber: 'APP-FPO-2025-002',
    location: 'Dehradun, Uttarakhand',
    contactPerson: 'Meena Sharma',
    phone: '+91 98765 43221',
    email: 'info@ukhillfarmer.org',
    members: 180,
    crops: ['Soybean', 'Mustard'],
    submittedDate: '2025-11-30',
    priority: 'medium',
    status: 'pending',
    documents: ['Registration Certificate', 'Member List', 'Bank Details'],
  },
  {
    id: 3,
    applicationType: 'License Renewal',
    applicantName: 'MP Processors & Traders Ltd',
    registrationNumber: 'APP-LIC-2025-003',
    location: 'Indore, Madhya Pradesh',
    contactPerson: 'Rajesh Verma',
    phone: '+91 98765 43222',
    email: 'license@mpprocessors.com',
    members: null,
    crops: ['Soybean Oil', 'Mustard Oil'],
    submittedDate: '2025-12-01',
    priority: 'low',
    status: 'under_review',
    documents: ['Current License', 'Tax Returns', 'Quality Certificates'],
  },
  {
    id: 4,
    applicationType: 'FPO Registration',
    applicantName: 'Chhattisgarh Seed Growers Union',
    registrationNumber: 'APP-FPO-2025-004',
    location: 'Raipur, Chhattisgarh',
    contactPerson: 'Anjali Thakur',
    phone: '+91 98765 43223',
    email: 'contact@cgseedgrowers.org',
    members: 450,
    crops: ['Groundnut', 'Sunflower', 'Sesame'],
    submittedDate: '2025-12-02',
    priority: 'high',
    status: 'pending',
    documents: ['Registration Certificate', 'Member List', 'Bank Details', 'Land Records', 'Bylaws'],
  },
  {
    id: 5,
    applicationType: 'Quality Certification',
    applicantName: 'Gujarat Premium Oils',
    registrationNumber: 'APP-QC-2025-005',
    location: 'Ahmedabad, Gujarat',
    contactPerson: 'Kiran Patel',
    phone: '+91 98765 43224',
    email: 'quality@gujaratpremium.com',
    members: null,
    crops: ['Groundnut Oil'],
    submittedDate: '2025-12-03',
    priority: 'medium',
    status: 'under_review',
    documents: ['Lab Test Reports', 'Quality Samples', 'Factory Audit'],
  },
];

const priorityConfig = {
  high: { color: 'bg-red-100 text-red-700', label: 'High Priority' },
  medium: { color: 'bg-orange-100 text-orange-700', label: 'Medium Priority' },
  low: { color: 'bg-blue-100 text-blue-700', label: 'Low Priority' },
};

function ApprovalsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredApplications = mockApplications.filter(app =>
    (statusFilter === 'all' || app.status === statusFilter) &&
    (typeFilter === 'all' || app.applicationType === typeFilter) &&
    (app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalApplications = mockApplications.length;
  const pendingApplications = mockApplications.filter(a => a.status === 'pending').length;
  const underReviewApplications = mockApplications.filter(a => a.status === 'under_review').length;
  const highPriorityApplications = mockApplications.filter(a => a.priority === 'high').length;

  const handleApprove = (appId: number, appName: string) => {
    toast.success(`Approved: ${appName}`);
    // Add API call here
  };

  const handleReject = (appId: number, appName: string) => {
    toast.error(`Rejected: ${appName}`);
    // Add API call here
  };

  const handleReview = (appId: number, appName: string) => {
    toast.loading(`Starting review for: ${appName}`);
    // Add API call here
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-gray-600 mt-1">Review and approve pending applications and registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalApplications}</p>
              </div>
              <FileText className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingApplications}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{underReviewApplications}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{highPriorityApplications}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by applicant name, registration number, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">Status:</span>
                {['all', 'pending', 'under_review'].map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">Type:</span>
                {['all', 'FPO Registration', 'License Renewal', 'Quality Certification'].map(type => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                  >
                    {type === 'all' ? 'All' : type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{app.applicantName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityConfig[app.priority as keyof typeof priorityConfig].color}`}>
                          {priorityConfig[app.priority as keyof typeof priorityConfig].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{app.applicationType} • {app.registrationNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{app.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="status" status={app.status}>
                    {app.status === 'pending' ? (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Under Review
                      </>
                    )}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Contact Person</p>
                    <p className="font-medium text-gray-900">{app.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <p className="font-medium text-gray-900">{app.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <p className="font-medium text-gray-900">{app.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Submitted On</p>
                    <p className="font-medium text-gray-900">{formatDate(app.submittedDate, 'P')}</p>
                  </div>
                </div>

                {/* FPO Specific Details */}
                {app.applicationType === 'FPO Registration' && app.members && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {app.members} Members
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 mb-1">Crops:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.crops.map((crop, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">SUBMITTED DOCUMENTS</p>
                  <div className="flex flex-wrap gap-2">
                    {app.documents.map((doc, idx) => (
                      <Button key={idx} variant="outline" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        {doc}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {app.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReview(app.id, app.applicantName)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Start Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(app.id, app.applicantName)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Quick Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(app.id, app.applicantName)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === 'under_review' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(app.id, app.applicantName)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(app.id, app.applicantName)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        Request More Info
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">View Full Application</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'pending' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No pending applications at the moment'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GovernmentApprovalsPage() {
  return (
    <ProtectedRoute allowedRoles={['government']}>
      <DashboardLayout>
        <ApprovalsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
