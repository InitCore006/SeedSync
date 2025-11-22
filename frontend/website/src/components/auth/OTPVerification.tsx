/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@components/common/Button'
import toast from 'react-hot-toast'

interface OTPVerificationProps {
  phoneNumber: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  isLoading?: boolean
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerify,
  onResend,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value) {
      const otpString = newOtp.join('')
      handleVerify(otpString)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])
    
    // Focus last filled input
    const lastIndex = Math.min(newOtp.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async (otpString: string) => {
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    try {
      await onVerify(otpString)
    } catch (error) {
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    try {
      await onResend()
      setResendTimer(60)
      toast.success('OTP resent successfully')
    } catch (error) {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-navy-900 mb-2">
          Verify Your Phone Number
        </h3>
        <p className="text-sm text-neutral-600">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-navy-900">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-neutral-300 rounded-lg focus:border-navy-600 focus:ring-2 focus:ring-navy-200 focus:outline-none transition-colors"
          />
        ))}
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={() => handleVerify(otp.join(''))}
        isLoading={isLoading}
        disabled={otp.join('').length !== 6}
      >
        Verify OTP
      </Button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-neutral-600">
            Resend OTP in{' '}
            <span className="font-medium text-navy-900">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-navy-600 hover:text-navy-800 font-medium"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}