'use client'

import { ReactNode } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@packages/ui'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  hint?: string
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: 'var(--gray-900)' }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  register?: UseFormRegisterReturn
  error?: boolean
}

export function Input({ register, error, className, ...props }: InputProps) {
  return (
    <input
      {...register}
      {...props}
      className={cn(
        'w-full px-4 py-3 rounded-xl border transition-all',
        'focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500',
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : 'border-gray-300',
        className
      )}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  register?: UseFormRegisterReturn
  error?: boolean
}

export function Textarea({ register, error, className, ...props }: TextareaProps) {
  return (
    <textarea
      {...register}
      {...props}
      className={cn(
        'w-full px-4 py-3 rounded-xl border transition-all resize-none',
        'focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500',
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : 'border-gray-300',
        className
      )}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  register?: UseFormRegisterReturn
  error?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function Select({ register, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <select
      {...register}
      {...props}
      className={cn(
        'w-full px-4 py-3 rounded-xl border transition-all',
        'focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500',
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : 'border-gray-300',
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
