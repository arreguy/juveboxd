export interface Review {
  id: string
  nickname: string
  rating: number
  comment: string
  timestamp: number
}

export interface CreateReviewRequest {
  nickname: string
  rating: number
  comment: string
}

const STORAGE_KEY = 'juveboxd_user_reviews'
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw86GJZbJxgQJQMaQ7m9T8d0g_rnOfbF23L217SmgDLZ0IRtpHhPvdhyjz7wPbU5ZIe/exec'

class ReviewsAPI {
  // Generate a unique ID for reviews
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  // Get reviews from localStorage
  private getStoredReviews(): Review[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load reviews from localStorage:', error)
      return []
    }
  }

  // Save reviews to localStorage
  private saveReviews(reviews: Review[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
    } catch (error) {
      console.error('Failed to save reviews to localStorage:', error)
      throw new Error('Failed to save review. Storage might be full.')
    }
  }

  // Send review to Google Apps Script
  private async sendToGoogleSheet(review: Review): Promise<void> {
    try {
      const formData = new URLSearchParams()
      formData.append('data', JSON.stringify(review))

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Avoid CORS issues with Google Apps Script
      })

      // Note: with no-cors mode, we can't read the response, but the data is still sent
      console.log('Review sent to Google Sheets successfully')
    } catch (error) {
      console.error('Failed to send review to Google Sheets:', error)
      // Don't throw - we still want to save locally even if Google Sheets fails
    }
  }

  // Get all user's reviews (local only)
  async getUserReviews(): Promise<Review[]> {
    return Promise.resolve(this.getStoredReviews())
  }

  // Create a new review (save locally and send to Google Sheets)
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const newReview: Review = {
      id: this.generateId(),
      nickname: data.nickname,
      rating: data.rating,
      comment: data.comment,
      timestamp: Date.now(),
    }

    // Save locally first
    const reviews = this.getStoredReviews()
    reviews.unshift(newReview) // Add to beginning
    this.saveReviews(reviews)

    // Send to Google Sheets in the background
    this.sendToGoogleSheet(newReview)

    return Promise.resolve(newReview)
  }

  // Get a specific review by ID
  async getReviewById(id: string): Promise<Review> {
    const reviews = this.getStoredReviews()
    const review = reviews.find(r => r.id === id)

    if (!review) {
      throw new Error('Review not found')
    }

    return Promise.resolve(review)
  }

  // Delete a review
  async deleteReview(id: string): Promise<void> {
    const reviews = this.getStoredReviews()
    const filteredReviews = reviews.filter(r => r.id !== id)
    this.saveReviews(filteredReviews)
    return Promise.resolve()
  }
}

export const reviewsAPI = new ReviewsAPI()
