document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('add-book-form');
    const addBookError = document.getElementById('add-book-error');

    if (!addBookForm) return;

    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const status = document.getElementById('book-status').value;

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            addBookError.textContent = 'You must be logged in to add books.';
            addBookError.classList.add('show');
            return;
        }

        const bookData = {
            title,
            author,
            status,
            userId: currentUser.id
        };

        try {
            const res = await fetch('http://localhost:5273/api/Books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });

            if (!res.ok) {
                const err = await res.json();
                addBookError.textContent = err.title || 'Failed to add book';
                addBookError.classList.add('show');
                return;
            }

            const newBook = await res.json();
            alert(`Book "${newBook.title}" added successfully!`);
            addBookForm.reset();

        } catch (error) {
            addBookError.textContent = 'Server error. Try again later.';
            addBookError.classList.add('show');
        }
    });
});