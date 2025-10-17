import type { IReadingListService } from './IReadingListService'
import type { ReadingList, ReadingListInput } from '@/models/ReadingList'
import apolloClient from '@/utils/apolloClient'
import { gql } from '@apollo/client/core'
import { GET_BOOKS_IN_LIST_QUERY } from './GqlBookService'

const GET_MY_READING_LISTS_QUERY = gql`
  query GetMyReadingLists {
    myReadingLists {
      readingListId
      name
      description
      books
    }
  }
`

const GET_READING_LIST_CONTAINING_BOOK_QUERY = gql`
  query ReadingListContainingBook($bookId: String!) {
    readingListContainingBook(bookId: $bookId) {
      readingListId
      name
    }
  }
`

const CREATE_READING_LIST_MUTATION = gql`
  mutation CreateReadingList($readingList: ReadingListRequestDTOInput!) {
    createReadingList(readingList: $readingList) {
      readingListId
      name
      description
      books
    }
  }
`

const ADD_BOOK_TO_LIST_MUTATION = gql`
  mutation AddBook($listId: String!, $bookId: String!) {
    addBookToReadingList(readingListId: $listId, bookId: $bookId)
  }
`

const REMOVE_BOOK_FROM_LIST_MUTATION = gql`
  mutation RemoveBook($listId: String!, $bookId: String!) {
    removeBookFromReadingList(readingListId: $listId, bookId: $bookId)
  }
`

const MOVE_BOOK_BETWEEN_LISTS_MUTATION = gql`
  mutation MoveBook($bookId: String!, $sourceId: String!, $targetId: String!) {
    moveBookBetweenReadingLists(
      bookId: $bookId
      sourceListId: $sourceId
      targetListId: $targetId
    )
  }
`

interface MyReadingListsQueryResult {
  myReadingLists: ReadingList[]
}
interface ReadingListContainingBookQueryResult {
  readingListContainingBook: ReadingList | null
}
interface CreateReadingListMutationResult {
  createReadingList: ReadingList
}

export class GqlReadingListService implements IReadingListService {
  public async getMyReadingLists(): Promise<ReadingList[]> {
    const { data } = await apolloClient.query<MyReadingListsQueryResult>({
      query: GET_MY_READING_LISTS_QUERY,
    })
    return data?.myReadingLists ?? []
  }

  public async getReadingListContainingBook(bookId: string): Promise<ReadingList | null> {
    const { data } = await apolloClient.query<ReadingListContainingBookQueryResult>({
      query: GET_READING_LIST_CONTAINING_BOOK_QUERY,
      variables: { bookId },
      fetchPolicy: 'network-only',
    })
    return data?.readingListContainingBook ?? null
  }

  public async createReadingList(details: ReadingListInput): Promise<ReadingList> {
    const { data } = await apolloClient.mutate<CreateReadingListMutationResult>({
      mutation: CREATE_READING_LIST_MUTATION,
      variables: { readingList: details },
      refetchQueries: [{ query: GET_MY_READING_LISTS_QUERY }],
      awaitRefetchQueries: true,
    })
    return data!.createReadingList
  }

  public async addBookToReadingList(listId: string, bookId: string): Promise<void> {
    await apolloClient.mutate({
      mutation: ADD_BOOK_TO_LIST_MUTATION,
      variables: { listId, bookId },
      refetchQueries: [
        { query: GET_MY_READING_LISTS_QUERY },
        { query: GET_READING_LIST_CONTAINING_BOOK_QUERY, variables: { bookId } },
        { query: GET_BOOKS_IN_LIST_QUERY, variables: { readingListId: listId } },
      ],
      awaitRefetchQueries: true,
    })
  }

  public async removeBookFromReadingList(listId: string, bookId: string): Promise<void> {
    await apolloClient.mutate({
      mutation: REMOVE_BOOK_FROM_LIST_MUTATION,
      variables: { listId, bookId },
      refetchQueries: [
        { query: GET_MY_READING_LISTS_QUERY },
        { query: GET_READING_LIST_CONTAINING_BOOK_QUERY, variables: { bookId } },
        { query: GET_BOOKS_IN_LIST_QUERY, variables: { readingListId: listId } },
      ],
      awaitRefetchQueries: true,
    })
  }

  public async moveBookBetweenReadingLists(
    bookId: string,
    sourceListId: string,
    targetListId: string,
  ): Promise<void> {
    await apolloClient.mutate({
      mutation: MOVE_BOOK_BETWEEN_LISTS_MUTATION,
      variables: { bookId, sourceId: sourceListId, targetId: targetListId },
      refetchQueries: [
        { query: GET_MY_READING_LISTS_QUERY },
        { query: GET_READING_LIST_CONTAINING_BOOK_QUERY, variables: { bookId } },
        { query: GET_BOOKS_IN_LIST_QUERY, variables: { readingListId: sourceListId } },
        { query: GET_BOOKS_IN_LIST_QUERY, variables: { readingListId: targetListId } },
      ],
      awaitRefetchQueries: true,
    })
  }
}