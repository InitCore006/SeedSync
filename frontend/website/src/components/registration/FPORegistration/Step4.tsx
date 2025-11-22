import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/common/Card'
import { FileUpload } from '@components/shared/FileUpload'
import { Shield, Eye, EyeOff } from 'lucide-react'

const step4Schema = z.object({
  registration_certificate: z.instanceof(File, { message: 'Registration certificate is required' }),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  bank_account_number: z.string().min(9, 'Invalid account number').max(18, 'Invalid account number'),
  ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  bank_name: z.string().min(3, 'Bank name is required'),
  branch_name: z.string().min(3, 'Branch name is required'),
  cancelled_cheque: z.instanceof(File, { message: 'Cancelled cheque is required' }),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
})

type Step4FormData = z.infer<typeof step4Schema>

interface Step4Props {
  onSubmit: (data: Step4FormData) => void
  onBack: () => void
  isSubmitting: boolean
}

export const Step4: React.FC<Step4Props> = ({ onSubmit, onBack, isSubmitting }) => {
  const [registrationCert, setRegistrationCert] = useState<File | null>(null)
  const [cancelledCheque, setCancelledCheque] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
  })

  const handleFormSubmit = (data: Step4FormData) => {
    if (!registrationCert || !cancelledCheque) {
      return
    }

    onSubmit({
      ...data,
      registration_certificate: registrationCert,
      cancelled_cheque: cancelledCheque,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-navy-700" />
          </div>
          <div>
            <CardTitle>Verification & Account Setup</CardTitle>
            <CardDescription>
              Final step - Upload documents and create your account
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Document Uploads */}
          <div className="space-y-4">
            <FileUpload
              label="Registration Certificate"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              onChange={(file) => {
                setRegistrationCert(file)
                if (file) setValue('registration_certificate', file)
              }}
              currentFile={registrationCert}
              error={errors.registration_certificate?.message}
              required
              helperText="Upload your organization registration certificate (PDF, JPG, PNG - Max 5MB)"
            />

            <FileUpload
              label="Cancelled Cheque"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              onChange={(file) => {
                setCancelledCheque(file)
                if (file) setValue('cancelled_cheque', file)
              }}
              currentFile={cancelledCheque}
              error={errors.cancelled_cheque?.message}
              required
              helperText="Upload a cancelled cheque for bank verification"
            />
          </div>

          {/* GST Details */}
          <div className="border-t border-neutral-200 pt-6">
            <h4 className="text-sm font-semibold text-navy-900 mb-4">
              GST & Tax Information
            </h4>
            <Input
              label="GSTIN"
              placeholder="e.g., 22AAAAA0000A1Z5"
              error={errors.gstin?.message}
              required
              {...register('gstin')}
              helperText="Enter your 15-digit GST Identification Number"
            />
          </div>

          {/* Banking Details */}
          <div className="border-t border-neutral-200 pt-6">
            <h4 className="text-sm font-semibold text-navy-900 mb-4">
              Banking Details
            </h4>

            <div className="space-y-4">
              <Input
                label="Bank Account Number"
                placeholder="Enter bank account number"
                error={errors.bank_account_number?.message}
                required
                {...register('bank_account_number')}
              />

              <Input
                label="IFSC Code"
                placeholder="e.g., SBIN0001234"
                error={errors.ifsc_code?.message}
                required
                {...register('ifsc_code')}
                helperText="11-character IFSC code of your bank branch"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  placeholder="Enter bank name"
                  error={errors.bank_name?.message}
                  required
                  {...register('bank_name')}
                />

                <Input
                  label="Branch Name"
                  placeholder="Enter branch name"
                  error={errors.branch_name?.message}
                  required
                  {...register('branch_name')}
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="border-t border-neutral-200 pt-6">
            <h4 className="text-sm font-semibold text-navy-900 mb-4">
              Account Credentials
            </h4>

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                error={errors.phone_number?.message}
                required
                {...register('phone_number')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                required
                {...register('password')}
                helperText="Minimum 8 characters with uppercase, lowercase, and numbers"
              />

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password_confirm?.message}
                required
                {...register('password_confirm')}
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-700">
              By submitting this registration, you agree to our{' '}
              <a href="/terms" className="text-navy-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-navy-600 hover:underline">
                Privacy Policy
              </a>
              . Your application will be reviewed by our team and you will be notified via email.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Submit Registration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}