import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@components/common/Card'
import { Input } from '@components/common/Input'
import { Textarea } from '@components/common/Textarea'
import { Select } from '@components/common/Select'
import { Button } from '@components/common/Button'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export const Contact: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunities' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' },
  ]

  const onSubmit = async (data: ContactFormData) => {
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      content: 'support@seedsync.in',
      link: 'mailto:support@seedsync.in',
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      content: '+91 1800-123-4567',
      link: 'tel:+911800123456 7',
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Office',
      content: 'Bangalore, Karnataka, India',
      link: null,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      content: 'Mon - Sat: 9:00 AM - 6:00 PM',
      link: null,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-neutral-300">
              Have questions? We'd love to hear from you. Send us a message and we'll
              respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">
                  Contact Information
                </h2>
                <p className="text-neutral-600 mb-8">
                  Reach out to us through any of these channels
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center text-navy-700 flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-1">
                          {info.title}
                        </h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-neutral-600 hover:text-navy-700"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-neutral-600">{info.content}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                      label="Full Name"
                      placeholder="Enter your name"
                      error={errors.name?.message}
                      required
                      {...register('name')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                        error={errors.phone?.message}
                        required
                        {...register('phone')}
                      />
                    </div>

                    <Select
                      label="Subject"
                      options={subjectOptions}
                      error={errors.subject?.message}
                      required
                      {...register('subject')}
                    />

                    <Textarea
                      label="Message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      error={errors.message?.message}
                      required
                      {...register('message')}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={isSubmitting}
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional - can add Google Maps) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Visit Our Office</h2>
            <p className="text-neutral-600 mb-8">
              We're located in the heart of Bangalore's tech hub
            </p>
            <div className="bg-neutral-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-neutral-500">Map integration will be added here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}