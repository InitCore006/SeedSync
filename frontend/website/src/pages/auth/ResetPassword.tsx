import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // TODO: Implement actual API call with token
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-navy-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-display font-bold text-navy-900">
              SeedSync
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-navy-900 mb-2">
            Reset Password
          </h2>
          <p className="text-neutral-600">
            Enter your new password below
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                leftIcon={<Lock className="h-5 w-5" />}
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
                leftIcon={<Lock className="h-5 w-5" />}
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                Reset Password
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-navy-600 hover:text-navy-800 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}