export interface Review {
  reviewId: string
  bookId: string
  userId: string
  reviewText: string | null
  rating: number
  publicationDate: string
  username: string
}

export interface ReviewStats {
  bookId: string
  totalReviews: number
  averageRating: number | null
}

export interface ReviewWithBookTitle {
  reviewId: string;
  bookId: string;
  bookTitle: string;
  rating: number;
  publicationDate: string;
}

export interface ReviewInput {
  bookId: string
  reviewId?: string | null
  rating: number
  reviewText?: string
}

