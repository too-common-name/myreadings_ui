import { GqlBookService } from './GqlBookService'
import { GqlReadingListService } from './GqlReadingListService'
import { GqlReviewService } from './GqlReviewService'
import { GqlUserService } from './GqlUserService'
import type { IBookService } from './IBookService'
import type { IReadingListService } from './IReadingListService'
import type { IReviewService } from './IReviewService'
import type { IUserService } from './IUserService'
import { RestBookService } from './RestBookService'
import { RestReadingListService } from './RestReadingListService'
import { RestReviewService } from './RestReviewService'
import { RestUserService } from './RestUserService'

const strategy = import.meta.env.VITE_API_STRATEGY?.toUpperCase()

let bookService: IBookService
let readingListService: IReadingListService
let reviewService: IReviewService
let userService: IUserService

if (strategy === 'GQL') {
  readingListService = new GqlReadingListService()
  reviewService = new GqlReviewService()
  userService = new GqlUserService()
  bookService = new GqlBookService(readingListService, reviewService)
} else {
  readingListService = new RestReadingListService()
  reviewService = new RestReviewService()
  userService = new RestUserService()
  bookService = new RestBookService(readingListService, reviewService)
}

export { bookService, readingListService, reviewService, userService }