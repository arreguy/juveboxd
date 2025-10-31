"use client"

import { useState } from "react"

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleClick = (starValue: number) => {
    onChange(starValue)
  }

  const handleMouseEnter = (starValue: number) => {
    setHoverValue(starValue)
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  const renderStar = (index: number) => {
    const starValue = index + 1
    const halfStarValue = index + 0.5
    const displayValue = hoverValue || value

    const isFullFilled = displayValue >= starValue
    const isHalfFilled = displayValue >= halfStarValue && displayValue < starValue

    const isHovered = hoverValue >= halfStarValue && hoverValue > value
    const isSelected = value >= halfStarValue && hoverValue === 0

    return (
      <div key={index} className="relative inline-block">
        {/* Half star (left side) */}
        <button
          type="button"
          className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          onClick={() => handleClick(halfStarValue)}
          onMouseEnter={() => handleMouseEnter(halfStarValue)}
          onMouseLeave={handleMouseLeave}
          aria-label={`Rate ${halfStarValue} stars`}
        />

        {/* Full star (right side) */}
        <button
          type="button"
          className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
          aria-label={`Rate ${starValue} stars`}
        />

        <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className={isHovered ? "text-[#3b82f6]" : "text-[#00e054]"}
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              width: "48px",
              height: "48px",
              clipPath: isFullFilled ? "inset(0 0 0 0)" : isHalfFilled ? "inset(0 50% 0 0)" : "inset(0 100% 0 0)",
            }}
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </div>
    )
  }

  return <div className="flex gap-2 justify-center">{[0, 1, 2, 3, 4].map((index) => renderStar(index))}</div>
}
