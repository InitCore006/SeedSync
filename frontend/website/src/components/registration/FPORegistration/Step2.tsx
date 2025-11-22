/* eslint-disable react-hooks/incompatible-library */
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@components/common/Input'
import { Textarea } from '@components/common/Textarea'
import { Button } from '@components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/common/Card'
import { LocationSelector } from '@components/shared/LocationSelector'
import { MapPin, Plus, X } from 'lucide-react'
import { OILSEEDS } from '@lib/constants'
import { Checkbox } from '@components/common/Checkbox'

const step2Schema = z.object({
  office_address: z.string().min(10, 'Office address is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  block: z.string().min(1, 'Block is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  operational_villages: z.array(z.string()).min(1, 'At least one village is required'),
  total_land_coverage: z.number().min(1, 'Land coverage must be greater than 0'),
  primary_oilseeds: z.array(z.string()).min(1, 'Select at least one oilseed'),
})

type Step2FormData = z.infer<typeof step2Schema>

interface Step2Props {
  onNext: (data: Step2FormData) => void
  onBack: () => void
  initialData?: Partial<Step2FormData>
}

export const Step2: React.FC<Step2Props> = ({ onNext, onBack, initialData }) => {
  const [villages, setVillages] = useState<string[]>(initialData?.operational_villages || [''])
  const [selectedOilseeds, setSelectedOilseeds] = useState<string[]>(
    initialData?.primary_oilseeds || []
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ...initialData,
      operational_villages: villages,
      primary_oilseeds: selectedOilseeds,
    },
  })

  const state = watch('state')
  const district = watch('district')

  const addVillage = () => {
    setVillages([...villages, ''])
  }

  const removeVillage = (index: number) => {
    const newVillages = villages.filter((_, i) => i !== index)
    setVillages(newVillages)
    setValue('operational_villages', newVillages)
  }

  const updateVillage = (index: number, value: string) => {
    const newVillages = [...villages]
    newVillages[index] = value
    setVillages(newVillages)
    setValue('operational_villages', newVillages)
  }

  const toggleOilseed = (oilseed: string) => {
    const newSelection = selectedOilseeds.includes(oilseed)
      ? selectedOilseeds.filter((o) => o !== oilseed)
      : [...selectedOilseeds, oilseed]
    
    setSelectedOilseeds(newSelection)
    setValue('primary_oilseeds', newSelection)
  }

  const onSubmit = (data: Step2FormData) => {
    onNext({
      ...data,
      operational_villages: villages.filter(v => v.trim() !== ''),
      primary_oilseeds: selectedOilseeds,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
            <MapPin className="h-6 w-6 text-navy-700" />
          </div>
          <div>
            <CardTitle>Location & Coverage Area</CardTitle>
            <CardDescription>
              Specify your office location and operational coverage
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Office Address */}
          <Textarea
            label="Office Address"
            placeholder="Enter complete office address"
            rows={3}
            error={errors.office_address?.message}
            required
            {...register('office_address')}
          />

          {/* Location */}
          <LocationSelector
            selectedState={state}
            selectedDistrict={district}
            onStateChange={(value) => setValue('state', value)}
            onDistrictChange={(value) => setValue('district', value)}
            stateError={errors.state?.message}
            districtError={errors.district?.message}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Block / Tehsil"
              placeholder="Enter block name"
              error={errors.block?.message}
              required
              {...register('block')}
            />

            <Input
              label="Pincode"
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              error={errors.pincode?.message}
              required
              {...register('pincode')}
            />
          </div>

          {/* GPS Coordinates (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude (Optional)"
              type="number"
              step="0.000001"
              placeholder="e.g., 28.7041"
              error={errors.latitude?.message}
              {...register('latitude', { valueAsNumber: true })}
            />

            <Input
              label="Longitude (Optional)"
              type="number"
              step="0.000001"
              placeholder="e.g., 77.1025"
              error={errors.longitude?.message}
              {...register('longitude', { valueAsNumber: true })}
            />
          </div>

          {/* Operational Villages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-navy-900">
                Operational Villages <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addVillage}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Village
              </Button>
            </div>

            <div className="space-y-3">
              {villages.map((village, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Village ${index + 1}`}
                    value={village}
                    onChange={(e) => updateVillage(index, e.target.value)}
                    className="flex-1"
                  />
                  {villages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVillage(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.operational_villages && (
              <p className="mt-1 text-sm text-red-600">
                {errors.operational_villages.message}
              </p>
            )}
          </div>

          {/* Total Land Coverage */}
          <Input
            label="Total Land Coverage (in acres)"
            type="number"
            placeholder="Enter total land coverage"
            min={1}
            error={errors.total_land_coverage?.message}
            required
            {...register('total_land_coverage', { valueAsNumber: true })}
          />

          {/* Primary Oilseeds */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-3">
              Primary Oilseeds Cultivated <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {OILSEEDS.map((oilseed) => (
                <Checkbox
                  key={oilseed}
                  label={oilseed}
                  checked={selectedOilseeds.includes(oilseed)}
                  onChange={() => toggleOilseed(oilseed)}
                />
              ))}
            </div>
            {errors.primary_oilseeds && (
              <p className="mt-2 text-sm text-red-600">
                {errors.primary_oilseeds.message}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" variant="primary">
              Continue to Infrastructure
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}