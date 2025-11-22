import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Badge } from '@components/common/Badge'
import { Search, Plus, Download, Filter } from 'lucide-react'

export const Members: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const members = [
    {
      id: 1,
      name: 'Ramesh Kumar',
      farmerId: 'FRM-001',
      phone: '9876543210',
      village: 'Kanakapura',
      landSize: '5 acres',
      crops: ['Groundnut', 'Sesame'],
      status: 'Active',
    },
    {
      id: 2,
      name: 'Suresh Patil',
      farmerId: 'FRM-002',
      phone: '9876543211',
      village: 'Ramanagara',
      landSize: '8 acres',
      crops: ['Sunflower', 'Safflower'],
      status: 'Active',
    },
    {
      id: 3,
      name: 'Mahesh Gowda',
      farmerId: 'FRM-003',
      phone: '9876543212',
      village: 'Mandya',
      landSize: '3 acres',
      crops: ['Groundnut'],
      status: 'Inactive',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Members</h1>
          <p className="text-neutral-600 mt-2">Manage your FPO members</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle>Member Directory</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
                Filter
              </Button>
              <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Farmer ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Village
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Land Size
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Crops
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-sm font-medium text-navy-900">
                      {member.farmerId}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{member.name}</td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{member.phone}</td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{member.village}</td>
                    <td className="py-3 px-4 text-sm text-neutral-700">{member.landSize}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {member.crops.map((crop, idx) => (
                          <Badge key={idx} variant="neutral">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={member.status === 'Active' ? 'success' : 'neutral'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}