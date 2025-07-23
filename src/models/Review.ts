export interface Review {
  reviewId: string; 
  bookId: string;   
  userId: string;   
  reviewText: string | null; 
  rating: number;   
  publicationDate: string; 
  username: string;
}