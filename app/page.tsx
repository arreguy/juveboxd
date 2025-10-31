"use client"

import type React from "react"

import { useState } from "react"
import { StarRating } from "@/components/star-rating"
import { ReviewCarousel } from "@/components/review-carousel"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"

interface Review {
  id: string
  nickname: string
  rating: number
  comment: string
  timestamp: number
}

export default function JuveboxdPage() {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Por favor, insira seu nome")
      return
    }

    if (rating < 0.5) {
      setError("Por favor, selecione pelo menos meia estrela")
      return
    }

    const newReview: Review = {
      id: Date.now().toString(),
      nickname: name.trim(),
      rating,
      comment,
      timestamp: Date.now(),
    }

    setReviews([newReview, ...reviews])
    setSubmitted(true)
    setError("")

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    setTimeout(() => {
      setRating(0)
      setName("")
      setComment("")
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="py-12 text-center border-b border-white/10">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-balance text-[#fbfb1f]">JUVEBOXD</h1>
        <p className="text-xl text-white/70 text-balance">
          Escreva o que achou do <span className="text-[#027dc0] font-semibold">JUV NIGHT SHOW</span>!
        </p>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8 rounded-2xl shadow-2xl shadow-[#00e054]/10">
          {submitted ? (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold mb-2 text-[#00e054]">Obrigado por assistir!</h2>
              <p className="text-white/70">Seu review foi salvo com sucesso</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label htmlFor="name" className="block text-lg font-semibold text-white">
                  Nome <span className="text-[#00e054]">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:border-[#00e054] focus:ring-[#00e054]/20 focus:bg-white/15"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-white">
                  Sua avaliação <span className="text-[#00e054]">*</span>
                </label>
                <StarRating value={rating} onChange={setRating} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <div className="space-y-4">
                <label htmlFor="review" className="block text-lg font-semibold text-white">
                  Seu review
                </label>
                <Textarea
                  id="review"
                  placeholder="Escreva o que você achou do show..."
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setComment(e.target.value)
                    }
                  }}
                  className="min-h-[150px] bg-white/10 border-white/30 text-white placeholder:text-white/50 resize-none rounded-xl focus:border-[#00e054] focus:ring-[#00e054]/20 focus:bg-white/15"
                />
                <p className="text-sm text-white/50 text-right">{comment.length}/300</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00ac1c] hover:bg-[#00ac1c]/90 text-white font-bold py-6 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-[#00ac1c]/50 hover:scale-[1.02]"
              >
                Salvar
              </Button>
            </form>
          )}
        </Card>

        {reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Reviews Recentes</h2>
            <ReviewCarousel reviews={reviews} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/10 mt-20">
        <p className="text-white/60 text-sm">
          Feito pelo{" "}
          <span className="font-bold text-[#fbfb1f] drop-shadow-[0_0_10px_rgba(251,251,31,0.5)]">Criativo JUV</span>
        </p>
      </footer>
    </div>
  )
}
