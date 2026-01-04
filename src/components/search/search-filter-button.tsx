"use client"

import { Button } from "@/components/ui/button"

interface SearchFilterButtonProps {
  label: string
  value: string
  options: { value: string; label: string }[]
}

const SearchFilterButton = ({
  label,
  value,
  options,
}: SearchFilterButtonProps) => {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Button variant="outline" size="sm">
      {selectedOption?.label ?? label}
    </Button>
  )
}

export default SearchFilterButton
