/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@components/common/Input'
import { Button } from '@components/common/Button'
import { useAuth } from '@hooks/useAuth'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Username or Email"
        type="text"
        placeholder="Enter your username or email"
        leftIcon={<Mail className="h-5 w-5" />}
        error={errors.username?.message}
        {...register('username')}
      />

      <div>
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
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
          {...register('password')}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-navy-600 hover:text-navy-800 font-medium"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isSubmitting}
      >
        Login
      </Button>

      <div className="text-center">
        <p className="text-sm text-neutral-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-navy-600 hover:text-navy-800 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  )
}