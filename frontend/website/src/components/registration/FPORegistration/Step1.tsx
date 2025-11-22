import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@components/common/Input'
import { Select } from '@components/common/Select'
import { Button } from '@components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/common/Card'
import { Building2 } from 'lucide-react'

const step1Schema = z.object({
  organization_name: z.string().min(3, 'Organization name must be at least 3 characters'),
  registration_type: z.enum(['FPO', 'COOPERATIVE', 'PRODUCER_COMPANY'] as const, {
    message: 'Please select registration type',
  }),
  registration_number: z.string().min(5, 'Registration number is required'),
  year_of_registration: z.number().min(1900).max(new Date().getFullYear()),
  total_members: z.number().min(1, 'Total members must be at least 1'),
  contact_person_name: z.string().min(3, 'Contact person name is required'),
  contact_person_designation: z.string().min(2, 'Designation is required'),
})

type Step1FormData = z.infer<typeof step1Schema>

interface Step1Props {
  onNext: (data: Step1FormData) => void
  initialData?: Partial<Step1FormData>
}

export const Step1: React.FC<Step1Props> = ({ onNext, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData,
  })

  const registrationTypeOptions = [
    { value: 'FPO', label: 'Farmer Producer Organization (FPO)' },
    { value: 'COOPERATIVE', label: 'Cooperative Society' },
    { value: 'PRODUCER_COMPANY', label: 'Producer Company' },
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 50 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-navy-700" />
          </div>
          <div>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Provide basic information about your organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          <Input
            label="Organization Name"
            placeholder="Enter your organization name"
            error={errors.organization_name?.message}
            required
            {...register('organization_name')}
          />

          <Select
            label="Registration Type"
            options={registrationTypeOptions}
            error={errors.registration_type?.message}
            required
            {...register('registration_type')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              placeholder="e.g., FPO/2020/12345"
              error={errors.registration_number?.message}
              required
              {...register('registration_number')}
            />

            <Select
              label="Year of Registration"
              options={yearOptions}
              error={errors.year_of_registration?.message}
              required
              {...register('year_of_registration', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Total Number of Members"
            type="number"
            placeholder="Enter total members"
            min={1}
            error={errors.total_members?.message}
            required
            {...register('total_members', { valueAsNumber: true })}
          />

          <div className="border-t border-neutral-200 pt-6">
            <h4 className="text-sm font-semibold text-navy-900 mb-4">
              Primary Contact Person
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter contact person name"
                error={errors.contact_person_name?.message}
                required
                {...register('contact_person_name')}
              />

              <Input
                label="Designation"
                placeholder="e.g., CEO, President"
                error={errors.contact_person_designation?.message}
                required
                {...register('contact_person_designation')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Continue to Location Details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}