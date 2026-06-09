"use client"

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-emerald-500" />,
        info: <Info className="h-4 w-4 text-[#0875E1]" />,
        warning: <TriangleAlert className="h-4 w-4 text-amber-500" />,
        error: <OctagonX className="h-4 w-4 text-red-500" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-[#0875E1]" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-white !text-[#0f1c2e] !border-[#E8EDF4] !shadow-elevated !rounded-xl text-[13px] font-medium",
          title: "!font-semibold !text-[#0f1c2e]",
          description: "!text-[#8898AA] !text-[12px]",
          actionButton: "!bg-[#0875E1] !text-white !rounded-lg !text-[12px] !font-semibold",
          cancelButton: "!bg-[#F8FAFC] !text-[#4B5565] !rounded-lg !text-[12px] !font-semibold !border !border-[#E8EDF4]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
