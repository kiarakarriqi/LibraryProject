// ===============================
// API URL bazë
// ===============================
const API_URL = 'http://localhost:5273/api/Books';

// ===============================
// Toast Notification Function
// ===============================
function showToast(message, type = 'success') {
  // Fshi toast të vjetër nëse ekziston
  const oldToast = document.querySelector('.toast');
  if (oldToast) {
    oldToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  
  // Automatikisht fshihet pas 4 sekondash
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// ===============================
// Funksionet e API-së
// ===============================
async function getBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch books');
    const books = await res.json();
    return books;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function addBookAPI(book) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error('Failed to add book');
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function updateBookAPI(id, book) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error('Failed to update book');
  } catch (err) {
    console.error(err);
  }
}

async function deleteBookAPI(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete book');
  } catch (err) {
    console.error(err);
  }
}

// ===============================
// Përditëso Dashboard
// ===============================
async function updateDashboard() {
  const books = await getBooks();
  console.log("Books from API:", books); 
  const total = books.length;
  const read = books.filter(b => b.status === 'Finished').length;
  const progress = total ? Math.round((read / total) * 100) : 0;

  const totalEl = document.getElementById('total-books');
  const readEl = document.getElementById('books-read');
  const progressEl = document.getElementById('progress');
  const barEl = document.getElementById('progress-bar');

  if (totalEl) totalEl.textContent = total;
  if (readEl) readEl.textContent = read;
  if (progressEl) progressEl.textContent = progress + '%';
  if (barEl) barEl.style.width = progress + '%';

  const wishlistEl = document.getElementById('wishlist-list');
  if (wishlistEl) {
    const wishlistBooks = books.filter(b => b.status === 'To Read');
    wishlistEl.innerHTML = '';

    if (wishlistBooks.length === 0) {
      wishlistEl.innerHTML = '<li>No books in wishlist 📭</li>';
    } else {
      wishlistBooks.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} - ${book.author}`;
        wishlistEl.appendChild(li);
      });
    }
  }
}

// ===============================
// Përditëso tabela me librat
// ===============================
async function updateBooksTable() {
  const tableBody = document.querySelector('#books-table tbody');
  if (!tableBody) return;

  const books = await getBooks();
  const filter = document.getElementById('filter-status')?.value || 'All';
  tableBody.innerHTML = '';

  books.forEach((b) => {
    if (filter === 'All' || b.status === filter) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td class="status-${b.status.replace(/\s/g,'')}">${b.status}</td>
        <td>
          <button onclick="openEditModal(${b.id})" class="edit-btn">Edit</button>
          <button onclick="deleteBook(${b.id})" class="delete-btn">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    }
  });
}

// ===============================
// Add Book form
// ===============================
const addForm = document.getElementById('add-book-form');
if (addForm) {
  addForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const status = document.getElementById('status').value;

    if (!title || !author) { 
      showToast('Please fill all fields!', 'warning'); 
      return; 
    }

    const books = await getBooks();
    const exists = books.some(b =>
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase() &&
      b.status.toLowerCase() === status.toLowerCase()
    );
    if (exists) { 
      showToast('This book already exists!', 'warning'); 
      return; 
    }

    await addBookAPI({ title, author, status });
    addForm.reset();
    showToast('Book added successfully! ✓', 'success');
    await updateDashboard();
    await updateBooksTable();
  });
}

// ===============================
// Delete Book
// ===============================
async function deleteBook(id) {
  if (confirm('Are you sure you want to delete this book?')) {
    await deleteBookAPI(id);
    showToast('Book deleted successfully!', 'success');
    await updateDashboard();
    await updateBooksTable();
  }
}

// ===============================
// Edit Book Modal
// ===============================
let currentEditId = null;

function openEditModal(id) {
  currentEditId = id;
  getBooks().then(books => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    let modal = document.getElementById('edit-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'edit-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close" onclick="closeEditModal()">&times;</span>
          <h2>Edit Book</h2>
          <form id="edit-form">
            <label>Title:</label>
            <input type="text" id="edit-title" required>
            
            <label>Author:</label>
            <input type="text" id="edit-author" required>
            
            <label>Status:</label>
            <select id="edit-status" required>
              <option value="To Read">To Read</option>
              <option value="Reading">Reading</option>
              <option value="Finished">Finished</option>
            </select>
            
            <div class="modal-buttons">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" onclick="closeEditModal()" class="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEdit();
      });
    }

    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-status').value = book.status;

    modal.style.display = 'block';
  });
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.style.display = 'none';
  currentEditId = null;
}

async function saveEdit() {
  const title = document.getElementById('edit-title').value.trim();
  const author = document.getElementById('edit-author').value.trim();
  const status = document.getElementById('edit-status').value;

  if (!title || !author) {
    showToast('Please fill all fields!', 'warning');
    return;
  }

  await updateBookAPI(currentEditId, { title, author, status });
  closeEditModal();
  await updateDashboard();
  await updateBooksTable();
  showToast('Book updated successfully! ✓', 'success');
}

window.onclick = function(event) {
  const modal = document.getElementById('edit-modal');
  if (event.target === modal) {
    closeEditModal();
  }
}

// ===============================
// Filter tek All Books
// ===============================
const filterSelect = document.getElementById('filter-status');
if (filterSelect) {
  filterSelect.addEventListener('change', async () => await updateBooksTable());
}

// ===============================
// Kur faqja ngarkohet
// ===============================
window.addEventListener('load', async function () {
  await updateDashboard();
  await updateBooksTable();
});
