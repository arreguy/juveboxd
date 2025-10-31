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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

class ReviewsAPI {
  private async fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async getAllReviews(): Promise<Review[]> {
    return this.fetchWithErrorHandling<Review[]>(`${API_BASE_URL}/reviews`)
  }

  async createReview(data: CreateReviewRequest): Promise<Review> {
    return this.fetchWithErrorHandling<Review>(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getReviewById(id: string): Promise<Review> {
    return this.fetchWithErrorHandling<Review>(`${API_BASE_URL}/reviews/${id}`)
  }

  async deleteReview(id: string): Promise<void> {
    await this.fetchWithErrorHandling<void>(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
    })
  }
}

export const reviewsAPI = new ReviewsAPI()
