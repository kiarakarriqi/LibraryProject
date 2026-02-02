var BOOKS_API_URL = 'http://localhost:5273/api/Books';

function getCurrentUserId() {
  return parseInt(sessionStorage.getItem('userId'), 10);
}

function showToast(message, type) {
  if (!type) type = 'success';
  var oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span>' + message + '</span>';
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(function() { if (toast.parentElement) toast.remove(); }, 300);
  }, 3000);
}

async function getBooks() {
  try {
    var userId = getCurrentUserId();
    var res = await fetch(BOOKS_API_URL + '/' + userId);
    if (!res.ok) throw new Error('Failed to fetch books');
    return await res.json();
  } catch (err) {
    console.error('getBooks error:', err);
    return [];
  }
}

async function addBookAPI(book) {
  try {
    book.userId = getCurrentUserId();
    var res = await fetch(BOOKS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('addBookAPI error:', err);
    return null;
  }
}

async function updateBookAPI(id, book) {
  try {
    book.userId = getCurrentUserId();
    var res = await fetch(BOOKS_API_URL + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error('Failed to update book');
  } catch (err) {
    console.error('updateBookAPI error:', err);
  }
}

async function deleteBookAPI(id) {
  try {
    var res = await fetch(BOOKS_API_URL + '/' + id + '/' + getCurrentUserId(), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete book');
  } catch (err) {
    console.error('deleteBookAPI error:', err);
  }
}

async function updateDashboard() {
  var books = await getBooks();
  var total = books.length;
  var read = books.filter(function(b) { return b.status === 'Finished'; }).length;
  var progress = total ? Math.round((read / total) * 100) : 0;
  var totalEl = document.getElementById('total-books');
  var readEl = document.getElementById('books-read');
  var progressEl = document.getElementById('progress');
  var barEl = document.getElementById('progress-bar');
  if (totalEl) totalEl.textContent = total;
  if (readEl) readEl.textContent = read;
  if (progressEl) progressEl.textContent = progress + '%';
  if (barEl) barEl.style.width = progress + '%';
  var wishlistEl = document.getElementById('wishlist-list');
  if (wishlistEl) {
    var wishlistBooks = books.filter(function(b) { return b.status === 'To Read'; });
    wishlistEl.innerHTML = '';
    if (wishlistBooks.length === 0) {
      wishlistEl.innerHTML = '<li>No books in wishlist</li>';
    } else {
      wishlistBooks.forEach(function(book) {
        var li = document.createElement('li');
        li.textContent = book.title + ' - ' + book.author;
        wishlistEl.appendChild(li);
      });
    }
  }
}

async function updateBooksTable() {
  var tableBody = document.querySelector('#books-table tbody');
  if (!tableBody) return;
  var books = await getBooks();
  var filterEl = document.getElementById('filter-status');
  var filter = filterEl ? filterEl.value : 'All';
  tableBody.innerHTML = '';
  if (books.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#888;">No books yet!</td></tr>';
    return;
  }
  books.forEach(function(b) {
    if (filter === 'All' || b.status === filter) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + b.title + '</td><td>' + b.author + '</td><td class="status-' + b.status.replace(/\s/g,'') + '">' + b.status + '</td><td><button onclick="openEditModal(' + b.id + ')" class="edit-btn">Edit</button><button onclick="deleteBook(' + b.id + ')" class="delete-btn">Delete</button></td>';
      tableBody.appendChild(tr);
    }
  });
}

var addForm = document.getElementById('add-book-form');
if (addForm) {
  addForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var title = document.getElementById('title').value.trim();
    var author = document.getElementById('author').value.trim();
    var status = document.getElementById('status').value;
    if (!title || !author) {
      showToast('Please fill all fields!', 'warning');
      return;
    }
    var result = await addBookAPI({ title: title, author: author, status: status });
    if (result) {
      addForm.reset();
      showToast('Book added successfully!', 'success');
      await updateDashboard();
      await updateBooksTable();
    } else {
      showToast('Failed to add book!', 'error');
    }
  });
}

async function deleteBook(id) {
  if (confirm('Are you sure?')) {
    await deleteBookAPI(id);
    showToast('Book deleted!', 'success');
    await updateDashboard();
    await updateBooksTable();
  }
}

var currentEditId = null;

function openEditModal(id) {
  currentEditId = id;
  getBooks().then(function(books) {
    var book = books.find(function(b) { return b.id === id; });
    if (!book) return;
    var modal = document.getElementById('edit-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'edit-modal';
      modal.className = 'modal';
      modal.innerHTML = '<div class="modal-content"><span class="close" onclick="closeEditModal()">&times;</span><h2>Edit Book</h2><form id="edit-form"><label>Title:</label><input type="text" id="edit-title" required><label>Author:</label><input type="text" id="edit-author" required><label>Status:</label><select id="edit-status"><option value="To Read">To Read</option><option value="Reading">Reading</option><option value="Finished">Finished</option></select><div class="modal-buttons"><button type="submit" class="save-btn">Save</button><button type="button" onclick="closeEditModal()" class="cancel-btn">Cancel</button></div></form></div>';
      document.body.appendChild(modal);
      document.getElementById('edit-form').addEventListener('submit', async function(e) {
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
  var modal = document.getElementById('edit-modal');
  if (modal) modal.style.display = 'none';
  currentEditId = null;
}

async function saveEdit() {
  var title = document.getElementById('edit-title').value.trim();
  var author = document.getElementById('edit-author').value.trim();
  var status = document.getElementById('edit-status').value;
  if (!title || !author) {
    showToast('Please fill all fields!', 'warning');
    return;
  }
  await updateBookAPI(currentEditId, { title: title, author: author, status: status });
  closeEditModal();
  await updateDashboard();
  await updateBooksTable();
  showToast('Book updated!', 'success');
}

window.onclick = function(event) {
  var modal = document.getElementById('edit-modal');
  if (event.target === modal) closeEditModal();
}

var filterSelect = document.getElementById('filter-status');
if (filterSelect) {
  filterSelect.addEventListener('change', async function() { await updateBooksTable(); });
}

window.addEventListener('load', async function() {
  await updateDashboard();
  await updateBooksTable();
});
