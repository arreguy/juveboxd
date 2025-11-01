"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { StarRating } from "@/components/star-rating"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"
import { reviewsAPI, type Review } from "@/lib/api/reviews"

export default function JuveboxdPage() {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Fetch user's reviews from localStorage on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true)
        const data = await reviewsAPI.getUserReviews()
        setReviews(data.sort((a, b) => b.timestamp - a.timestamp))
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setReviews([])
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Por favor, insira seu nome")
      return
    }

    if (rating < 0.5) {
      setError("Por favor, selecione pelo menos meia estrela")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const newReview = await reviewsAPI.createReview({
        nickname: name.trim(),
        rating,
        comment,
      })

      setReviews([newReview, ...reviews])
      setSubmitted(true)

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar review"
      setError(errorMessage)
      console.error("Failed to create review:", err)
    } finally {
      setIsLoading(false)
    }
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
                disabled={isLoading}
                className="w-full bg-[#00ac1c] hover:bg-[#00ac1c]/90 text-white font-bold py-6 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-[#00ac1c]/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          )}
        </Card>

        {isLoadingReviews ? (
          <div className="mt-12 text-center">
            <p className="text-white/60">Carregando seus reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Seus Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="bg-white/5 backdrop-blur-xl border-white/10 p-6 rounded-xl shadow-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg text-white">{review.nickname}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xl ${
                                i < Math.floor(review.rating)
                                  ? "text-[#00e054]"
                                  : i < review.rating
                                  ? "text-[#00e054] opacity-50"
                                  : "text-white/20"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-[#00e054] font-bold">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm("Deseja realmente excluir este review?")) {
                          try {
                            await reviewsAPI.deleteReview(review.id)
                            setReviews(reviews.filter((r) => r.id !== review.id))
                          } catch (err) {
                            console.error("Failed to delete review:", err)
                          }
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                  {review.comment && (
                    <p className="text-white/80 leading-relaxed">{review.comment}</p>
                  )}
                  <p className="text-white/40 text-sm mt-3">
                    {new Date(review.timestamp).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
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
