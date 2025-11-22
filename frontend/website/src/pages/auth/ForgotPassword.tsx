import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Password reset link sent to your email')
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
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
            Forgot Password?
          </h2>
          <p className="text-neutral-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                required
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-navy-600 hover:text-navy-800 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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