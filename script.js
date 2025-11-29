// Data and Constants
const IMAGE_URL = "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg";
let books = loadBooks(); // Load books from local storage on startup
let currentFilter = 'All';

// DOM Elements
const booksDisplay = document.getElementById('booksDisplay');
const addBookForm = document.getElementById('addBookForm');
const sortByAToZButton = document.getElementById('sortByAToZ');
const sortByZToAButton = document.getElementById('sortByZToA');
const filterCategoryDropdown = document.getElementById('filterCategory');
const emptyMessage = document.getElementById('emptyMessage');

// --- Storage Functions ---
/**
 * Loads books array from Local Storage, or returns an empty array if none exists.
 * @returns {Array<Object>} The books array.
 */
function loadBooks() {
    const storedBooks = localStorage.getItem('domBookAppBooks');
    return storedBooks ? JSON.parse(storedBooks) : [];
}

/**
 * Saves the current books array to Local Storage.
 */
function saveBooks() {
    localStorage.setItem('domBookAppBooks', JSON.stringify(books));
}

// --- DOM Manipulation / Rendering ---

/**
 * Creates the HTML card for a single book object.
 * @param {Object} book - The book object to render.
 * @returns {string} The HTML string for the book card.
 */
function createBookCard(book) {
    return `
        <div class="book-card box-shadow" data-title="${book.title.toLowerCase()}">
            <img src="${book.imageUrl}" alt="${book.title}">
            <div>
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <span class="category-tag">${book.category}</span>
            </div>
            <button class="button delete-button" data-title="${book.title}" data-author="${book.author}">
                Delete Book
            </button>
        </div>
    `;
}

/**
 * Renders the filtered/sorted books to the UI.
 */
function renderBooks() {
    // 1. Apply Filtering
    const booksToRender = books.filter(book => {
        return currentFilter === 'All' || book.category === currentFilter;
    });

    // 2. Check for empty results
    if (booksToRender.length === 0) {
        booksDisplay.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        return;
    }

    // Hide empty message if books are present
    emptyMessage.classList.add('hidden');

    // 3. Generate HTML and update DOM
    const htmlCards = booksToRender.map(createBookCard).join('');
    booksDisplay.innerHTML = htmlCards;

    // 4. Attach Delete Listeners to newly rendered buttons
    attachDeleteListeners();
}

/**
 * Attaches event listeners to all 'Delete Book' buttons.
 * This needs to be done after every renderBooks call.
 */
function attachDeleteListeners() {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const title = event.target.dataset.title;
            const author = event.target.dataset.author;
            deleteBook(title, author);
        });
    });
}

// --- Core Functionality ---

/**
 * Adds a new book to the array and re-renders the UI.
 * @param {Event} event - The form submission event.
 */
function handleAddBook(event) {
    event.preventDefault();

    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const categoryInput = document.getElementById('category');

    const newBook = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        category: categoryInput.value,
        imageUrl: IMAGE_URL // Using the fixed image URL
    };

    if (newBook.title && newBook.author) {
        books.push(newBook);
        saveBooks();
        renderBooks();
        addBookForm.reset();
    }
}

/**
 * Deletes a book by title and author (assuming this combination is unique for simplicity).
 * @param {string} title - The title of the book to delete.
 * @param {string} author - The author of the book to delete.
 */
function deleteBook(title, author) {
    const initialLength = books.length;
    
    // Filter out the book to be deleted
    books = books.filter(book => !(book.title === title && book.author === author));

    if (books.length !== initialLength) {
        saveBooks();
        renderBooks(); // Re-render the UI after deletion
    }
}

/**
 * Sorts the books array by title and re-renders the UI.
 * @param {string} direction - 'asc' (A to Z) or 'desc' (Z to A).
 */
function sortBooks(direction) {
    books.sort((a, b) => {
        const titleA = a.title.toUpperCase();
        const titleB = b.title.toUpperCase();
        if (titleA < titleB) return direction === 'asc' ? -1 : 1;
        if (titleA > titleB) return direction === 'asc' ? 1 : -1;
        return 0; // Titles are equal
    });
    renderBooks();
}

/**
 * Handles category filtering when the dropdown value changes.
 * @param {Event} event - The change event from the dropdown.
 */
function handleFilterChange(event) {
    currentFilter = event.target.value;
    renderBooks();
}

// --- Event Listeners ---
if (addBookForm) {
    addBookForm.addEventListener('submit', handleAddBook);
    
    // Sorting listeners
    sortByAToZButton.addEventListener('click', () => sortBooks('asc'));
    sortByZToAButton.addEventListener('click', () => sortBooks('desc'));

    // Filtering listener
    filterCategoryDropdown.addEventListener('change', handleFilterChange);

    // Initial render when the page loads
    renderBooks();
}
