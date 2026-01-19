import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`} {...props} />
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function CardTitle({ className = '', ...props }: CardTitleProps) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className = '', ...props }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props} />
  )
}

export { Card, CardHeader, CardTitle, CardContent }