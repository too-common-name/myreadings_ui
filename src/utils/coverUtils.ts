import type { Book } from '@/models/Book'

export function getCoverUrl(book: Book, size: 'S' | 'M' | 'L'): string {
  if (book.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`
  } else if (book.coverImageId) {
    return `https://covers.openlibrary.org/b/id/${book.coverImageId}-${size}.jpg`
  }

  const placeholderWidth = size === 'S' ? 60 : size === 'M' ? 100 : 300
  const placeholderHeight = size === 'S' ? 90 : size === 'M' ? 150 : 450
  return `https://placehold.co/${placeholderWidth}x${placeholderHeight}/EEEEEE/AAAAAA?text=No+Cover`
}
