const { nanoid } = require('nanoid');
const books = require('./books');

// Menambahkan buku
const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading = false
    } = request.payload;

    if (!name) {
        return h.response({ status: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' }).code(400);
    }

    if (readPage < 0 || pageCount < 0) {
        return h.response({
            status: 'fail',
            message: 'tidak bisa memperbarui buku. readPage dan pageCount tidak boleh negatif'
        }).code(400);
    }

    if (readPage > pageCount) {
        return h.response({ status: 'fail', message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };
    books.push(newBook);
    console.log("Payload diterima:", request.payload);
    return h.response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } }).code(201);
};

// Mendapatkan daftar semua buku
const getAllBooksHandler = (request, H) => {
    let filteredBooks = books;

    if (request.query.reading !== undefined) {
        const isReading = request.query.reading === '1';
        filteredBooks = filteredBooks.filter(book => book.reading === isReading);
    }

    if (request.query.finished !== undefined) {
        const isFinished = request.query.finished === '1';
        filteredBooks = filteredBooks.filter(book => book.finished === isFinished);
    }

    if (request.query.name) {
        filteredBooks = filteredBooks.filter(book =>
            book.name.toLowerCase().includes(request.query.name.toLowerCase())
        );
    }

    return h.response({
        status: 'success',
        data: {
            books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
        },
    }).code(200);
};

// Mendapatkan detail buku berdasarkan ID
const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const book = books.find(b => b.id === bookId);

    if (!book) {
        return h.response({ status: 'fail', message: 'Buku tidak ditemukan' }).code(404);
    }

    return h.response({ status: 'success', data: { book } }).code(200);
};

// Mengubah data buku berdasarkan ID
const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' }).code(404);
    }
    if (!name) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Mohon isi nama buku' }).code(400);
    }
    if (readPage > pageCount) {
        return h.response({ status: 'fail', message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
    }

    books[bookIndex] = { ...books[bookIndex], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt: new Date().toISOString(), finished: pageCount === readPage };

    return h.response({ status: 'success', message: 'Buku berhasil diperbarui' }).code(200);
};

// Menghapus buku berdasarkan ID
const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
        return h.response({ status: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' }).code(404);
    }

    books.splice(bookIndex, 1);
    return h.response({ status: 'success', message: 'Buku berhasil dihapus' }).code(200);
};

module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };
