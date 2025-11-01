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
          <path d="M12 2.5C12.3 2.5 12.5 2.7 12.6 3L14.8 8.3C14.9 8.5 15.1 8.7 15.3 8.7L21 9.3C21.3 9.3 21.5 9.5 21.6 9.7C21.7 10 21.6 10.3 21.4 10.5L17.1 14.3C16.9 14.5 16.8 14.8 16.9 15L18.2 20.6C18.3 20.9 18.2 21.2 18 21.4C17.8 21.6 17.5 21.6 17.2 21.5L12.4 18.8C12.2 18.7 11.8 18.7 11.6 18.8L6.8 21.5C6.5 21.6 6.2 21.6 6 21.4C5.8 21.2 5.7 20.9 5.8 20.6L7.1 15C7.2 14.8 7.1 14.5 6.9 14.3L2.6 10.5C2.4 10.3 2.3 10 2.4 9.7C2.5 9.5 2.7 9.3 3 9.3L8.7 8.7C8.9 8.7 9.1 8.5 9.2 8.3L11.4 3C11.5 2.7 11.7 2.5 12 2.5Z" />
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
            <path d="M12 2.5C12.3 2.5 12.5 2.7 12.6 3L14.8 8.3C14.9 8.5 15.1 8.7 15.3 8.7L21 9.3C21.3 9.3 21.5 9.5 21.6 9.7C21.7 10 21.6 10.3 21.4 10.5L17.1 14.3C16.9 14.5 16.8 14.8 16.9 15L18.2 20.6C18.3 20.9 18.2 21.2 18 21.4C17.8 21.6 17.5 21.6 17.2 21.5L12.4 18.8C12.2 18.7 11.8 18.7 11.6 18.8L6.8 21.5C6.5 21.6 6.2 21.6 6 21.4C5.8 21.2 5.7 20.9 5.8 20.6L7.1 15C7.2 14.8 7.1 14.5 6.9 14.3L2.6 10.5C2.4 10.3 2.3 10 2.4 9.7C2.5 9.5 2.7 9.3 3 9.3L8.7 8.7C8.9 8.7 9.1 8.5 9.2 8.3L11.4 3C11.5 2.7 11.7 2.5 12 2.5Z" />
          </svg>
        </div>
      </div>
    )
  }

  return <div className="flex gap-2 justify-center">{[0, 1, 2, 3, 4].map((index) => renderStar(index))}</div>
}
