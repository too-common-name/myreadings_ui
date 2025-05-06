export interface Book {
    bookId: string;
    coverImageId: string;
    description: string;
    isbn: string;
    originalLanguage: string;
    pageCount: number;
    publicationDate: string; // Date can be used but requires deserialization
    publisher: string;
    title: string;
    genre: string;
}