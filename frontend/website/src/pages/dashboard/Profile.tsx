/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/common/Tabs'
import { User, Building2, Lock, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export const Profile: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900">Profile Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant={isEditing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    defaultValue={user?.full_name}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={user?.email}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    defaultValue={user?.phone_number}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Designation"
                    defaultValue={user?.role_display}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Organization Name"
                  defaultValue={user?.email}
                  disabled
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Registration Number"
                    defaultValue="FPO/2023/12345"
                    disabled
                  />
                  <Input
                    label="GSTIN"
                    defaultValue="22AAAAA0000A1Z5"
                    disabled
                  />
                </div>

                <Input
                  label="Office Address"
                  defaultValue="123 Main Street, Bangalore, Karnataka - 560001"
                  disabled
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="State" defaultValue="Karnataka" disabled />
                  <Input label="District" defaultValue="Bangalore Urban" disabled />
                  <Input label="Pincode" defaultValue="560001" disabled />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Organization details cannot be edited directly.
                    Please contact support to update these fields.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                />

                <Button variant="primary" onClick={handleChangePassword}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-navy-900">Enable 2FA</p>
                  <p className="text-sm text-neutral-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="secondary">Setup 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Order Updates', description: 'Receive notifications about new orders and updates' },
                  { title: 'Payment Alerts', description: 'Get notified when payments are received' },
                  { title: 'Inventory Alerts', description: 'Low stock and inventory warnings' },
                  { title: 'System Updates', description: 'Important system announcements and updates' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-200">
                    <div>
                      <p className="font-medium text-navy-900">{item.title}</p>
                      <p className="text-sm text-neutral-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}