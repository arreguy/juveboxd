"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Review {
  id: string
  nickname: string
  rating: number
  comment: string
  timestamp: number
}

interface ReviewCarouselProps {
  reviews: Review[]
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reviews.slice(0, 6).map((review) => (
        <Card
          key={review.id}
          className="bg-white/5 backdrop-blur-xl border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-white/90">{review.nickname}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#00e054]" fill="#00e054" />
              <span className="text-[#00e054] font-bold">{review.rating.toFixed(1)}</span>
            </div>
          </div>
          {review.comment && <p className="text-white/70 text-sm line-clamp-3">{review.comment}</p>}
        </Card>
      ))}
    </div>
  )
}
