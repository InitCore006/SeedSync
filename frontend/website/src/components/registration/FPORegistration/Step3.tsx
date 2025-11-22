/* eslint-disable react-hooks/incompatible-library */
import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@components/common/Input'
import { Select } from '@components/common/Select'
import { Button } from '@components/common/Button'
import { Checkbox } from '@components/common/Checkbox'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/common/Card'
import { LocationSelector } from '@components/shared/LocationSelector'
import { Warehouse, Plus, Trash2 } from 'lucide-react'

const warehouseSchema = z.object({
  warehouse_name: z.string().min(3, 'Warehouse name is required'),
  warehouse_type: z.enum(['OWNED', 'RENTED', 'LEASED']),
  storage_type: z.enum(['OPEN', 'COVERED', 'COLD_STORAGE']),
  total_capacity: z.number().min(1, 'Capacity must be greater than 0'),
  address: z.string().min(10, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  has_weighbridge: z.boolean(),
  has_quality_testing: z.boolean(),
  has_security: z.boolean(),
})

const vehicleSchema = z.object({
  vehicle_number: z.string().min(5, 'Vehicle number is required'),
  vehicle_type: z.enum(['TRUCK', 'TRACTOR', 'PICKUP', 'OTHER']),
  capacity: z.number().min(1, 'Capacity is required'),
  driver_name: z.string().min(3, 'Driver name is required'),
  driver_phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
})

const step3Schema = z.object({
  has_storage: z.boolean(),
  has_transport: z.boolean(),
  uses_logistics_partners: z.boolean(),
  average_annual_procurement: z.number().min(0),
  warehouses: z.array(warehouseSchema).optional(),
  vehicles: z.array(vehicleSchema).optional(),
})

type Step3FormData = z.infer<typeof step3Schema>

interface Step3Props {
  onNext: (data: Step3FormData) => void
  onBack: () => void
  initialData?: Partial<Step3FormData>
}

export const Step3: React.FC<Step3Props> = ({ onNext, onBack, initialData }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData || {
      has_storage: false,
      has_transport: false,
      uses_logistics_partners: false,
      average_annual_procurement: 0,
      warehouses: [],
      vehicles: [],
    },
  })

  const {
    fields: warehouseFields,
    append: appendWarehouse,
    remove: removeWarehouse,
  } = useFieldArray({
    control,
    name: 'warehouses',
  })

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control,
    name: 'vehicles',
  })

  const hasStorage = watch('has_storage')
  const hasTransport = watch('has_transport')

  const warehouseTypeOptions = [
    { value: 'OWNED', label: 'Owned' },
    { value: 'RENTED', label: 'Rented' },
    { value: 'LEASED', label: 'Leased' },
  ]

  const storageTypeOptions = [
    { value: 'OPEN', label: 'Open Storage' },
    { value: 'COVERED', label: 'Covered Storage' },
    { value: 'COLD_STORAGE', label: 'Cold Storage' },
  ]

  const vehicleTypeOptions = [
    { value: 'TRUCK', label: 'Truck' },
    { value: 'TRACTOR', label: 'Tractor' },
    { value: 'PICKUP', label: 'Pickup' },
    { value: 'OTHER', label: 'Other' },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
            <Warehouse className="h-6 w-6 text-navy-700" />
          </div>
          <div>
            <CardTitle>Infrastructure Details</CardTitle>
            <CardDescription>
              Provide information about storage and transportation facilities
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-6">
          {/* Basic Infrastructure */}
          <div className="space-y-4">
            <Checkbox
              label="We have storage facilities"
              {...register('has_storage')}
            />

            <Checkbox
              label="We have our own transport vehicles"
              {...register('has_transport')}
            />

            <Checkbox
              label="We use third-party logistics partners"
              {...register('uses_logistics_partners')}
            />
          </div>

          <Input
            label="Average Annual Procurement (in Quintals)"
            type="number"
            placeholder="Enter average annual procurement"
            min={0}
            error={errors.average_annual_procurement?.message}
            required
            {...register('average_annual_procurement', { valueAsNumber: true })}
          />

          {/* Warehouse Details */}
          {hasStorage && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-navy-900">
                  Warehouse Details
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendWarehouse({
                    warehouse_name: '',
                    warehouse_type: 'OWNED',
                    storage_type: 'COVERED',
                    total_capacity: 0,
                    address: '',
                    state: '',
                    district: '',
                    pincode: '',
                    has_weighbridge: false,
                    has_quality_testing: false,
                    has_security: false,
                  })}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Warehouse
                </Button>
              </div>

              {warehouseFields.map((field, index) => (
                <div key={field.id} className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-navy-900">
                      Warehouse {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeWarehouse(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Warehouse Name"
                      placeholder="Enter warehouse name"
                      error={errors.warehouses?.[index]?.warehouse_name?.message}
                      {...register(`warehouses.${index}.warehouse_name`)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Warehouse Type"
                        options={warehouseTypeOptions}
                        error={errors.warehouses?.[index]?.warehouse_type?.message}
                        {...register(`warehouses.${index}.warehouse_type`)}
                      />

                      <Select
                        label="Storage Type"
                        options={storageTypeOptions}
                        error={errors.warehouses?.[index]?.storage_type?.message}
                        {...register(`warehouses.${index}.storage_type`)}
                      />
                    </div>

                    <Input
                      label="Total Capacity (in Quintals)"
                      type="number"
                      placeholder="Enter capacity"
                      min={1}
                      error={errors.warehouses?.[index]?.total_capacity?.message}
                      {...register(`warehouses.${index}.total_capacity`, { valueAsNumber: true })}
                    />

                    <Input
                      label="Address"
                      placeholder="Enter warehouse address"
                      error={errors.warehouses?.[index]?.address?.message}
                      {...register(`warehouses.${index}.address`)}
                    />

                    <LocationSelector
                      selectedState={watch(`warehouses.${index}.state`) ?? ''}
                      selectedDistrict={watch(`warehouses.${index}.district`) ?? ''}
                      onStateChange={(value) => setValue(`warehouses.${index}.state`, value)}
                      onDistrictChange={(value) => setValue(`warehouses.${index}.district`, value)}
                      stateError={errors.warehouses?.[index]?.state?.message}
                      districtError={errors.warehouses?.[index]?.district?.message}
                    />

                    <Input
                      label="Pincode"
                      placeholder="Enter pincode"
                      maxLength={6}
                      error={errors.warehouses?.[index]?.pincode?.message}
                      {...register(`warehouses.${index}.pincode`)}
                    />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-navy-900">Facilities Available</p>
                      <Checkbox
                        label="Weighbridge"
                        {...register(`warehouses.${index}.has_weighbridge`)}
                      />
                      <Checkbox
                        label="Quality Testing Lab"
                        {...register(`warehouses.${index}.has_quality_testing`)}
                      />
                      <Checkbox
                        label="24/7 Security"
                        {...register(`warehouses.${index}.has_security`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vehicle Details */}
          {hasTransport && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-navy-900">
                  Vehicle Details
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendVehicle({
                    vehicle_number: '',
                    vehicle_type: 'TRUCK',
                    capacity: 0,
                    driver_name: '',
                    driver_phone: '',
                  })}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Vehicle
                </Button>
              </div>

              {vehicleFields.map((field, index) => (
                <div key={field.id} className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-navy-900">
                      Vehicle {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Vehicle Number"
                        placeholder="e.g., DL01AB1234"
                        error={errors.vehicles?.[index]?.vehicle_number?.message}
                        {...register(`vehicles.${index}.vehicle_number`)}
                      />

                      <Select
                        label="Vehicle Type"
                        options={vehicleTypeOptions}
                        error={errors.vehicles?.[index]?.vehicle_type?.message}
                        {...register(`vehicles.${index}.vehicle_type`)}
                      />
                    </div>

                    <Input
                      label="Capacity (in Quintals)"
                      type="number"
                      placeholder="Enter capacity"
                      min={1}
                      error={errors.vehicles?.[index]?.capacity?.message}
                      {...register(`vehicles.${index}.capacity`, { valueAsNumber: true })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Driver Name"
                        placeholder="Enter driver name"
                        error={errors.vehicles?.[index]?.driver_name?.message}
                        {...register(`vehicles.${index}.driver_name`)}
                      />

                      <Input
                        label="Driver Phone"
                        placeholder="Enter 10-digit phone"
                        maxLength={10}
                        error={errors.vehicles?.[index]?.driver_phone?.message}
                        {...register(`vehicles.${index}.driver_phone`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" variant="primary">
              Continue to Verification
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}