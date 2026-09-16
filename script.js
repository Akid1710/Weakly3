// State global untuk menampung data siswa
let students = [];
let alertTimeout = null;

// Elemen DOM
const studentList = document.getElementById('studentList');
const studentForm = document.getElementById('studentForm');
const studentName = document.getElementById('studentName');
const studentScore = document.getElementById('studentScore');
const studentId = document.getElementById('studentId');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const alertMessage = document.getElementById('alertMessage');
const totalStudentsEl = document.getElementById('totalStudents');
const averageScoreEl = document.getElementById('averageScore');

// Initial load dari LocalStorage
loadStudents();
renderStudents();

// Event Listener Submit Form (Menangani Add & Update)
studentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameVal = studentName.value.trim();
  const scoreVal = parseFloat(studentScore.value);
  const idVal = studentId.value;

  if (!nameVal || isNaN(scoreVal)) return;

  if (idVal) {
    // Mode Update
    updateStudent(Number(idVal), nameVal, scoreVal);
  } else {
    // Mode Add
    addStudent(nameVal, scoreVal);
  }

  resetForm();
  saveStudents();
  renderStudents();
});

// Event Listener Batal Edit
cancelBtn.addEventListener('click', () => {
  resetForm();
});

// Mengambil data dari LocalStorage saat pertama kali load
function loadStudents() {
  const data = localStorage.getItem('hsiStudents');
  students = data ? JSON.parse(data) : [];
}

// Menyimpan data ke LocalStorage
function saveStudents() {
  localStorage.setItem('hsiStudents', JSON.stringify(students));
}

// Menambahkan Siswa
function addStudent(name, score) {
  const newStudent = {
    id: Date.now(), // Generate ID unik berdasarkan timestamp
    nama: name,
    score: score
  };
  students.push(newStudent);
  showAlert(`✅ Data siswa ${name} berhasil ditambahkan.`, 'add');
}

// Menyiapkan Form untuk Edit Siswa
function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  studentId.value = student.id;
  studentName.value = student.nama;
  studentScore.value = student.score;

  formTitle.textContent = '✏️ Edit Siswa';
  submitBtn.textContent = '💾 Update Siswa';
  cancelBtn.style.display = 'inline-block';
  studentName.focus();
}

// Memperbarui Data Siswa
function updateStudent(id, name, score) {
  const index = students.findIndex((s) => s.id === id);
  if (index !== -1) {
    students[index].nama = name;
    students[index].score = score;
    showAlert(`🔄 Data siswa ${name} berhasil diperbarui.`, 'update');
  }
}

// Menghapus Data Siswa dengan Confirm Dialog
function deleteStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  const isConfirmed = confirm(`Apakah kamu yakin ingin menghapus siswa ${student.nama}?`);
  if (isConfirmed) {
    students = students.filter((s) => s.id !== id);
    saveStudents();
    renderStudents();
    showAlert(`🗑️ Data siswa ${student.nama} berhasil dihapus.`, 'delete');

    // Jika siswa yang sedang diedit dihapus, reset form
    if (studentId.value == id) {
      resetForm();
    }
  }
}

// Mereset Form ke Mode Tambah
function resetForm() {
  studentForm.reset();
  studentId.value = '';
  formTitle.textContent = '➕ Tambah Siswa';
  submitBtn.textContent = '➕ Tambah Siswa';
  cancelBtn.style.display = 'none';
}

// Render UI Siswa dan Statistik
function renderStudents() {
  studentList.innerHTML = '';

  if (students.length === 0) {
    studentList.innerHTML = '<div class="empty">📭 Belum ada data siswa.</div>';
  } else {
    students.forEach((student, index) => {
      const item = document.createElement('div');
      item.className = 'student-item';
      item.innerHTML = `
        <div class="student-name">
          <span class="student-number">${index + 1}.</span>
          ${student.nama}
        </div>
        <div class="score">${student.score}</div>
        <div class="action-buttons">
          <button class="edit-btn" type="button" onclick="editStudent(${student.id})">✏️ Ubah</button>
          <button class="delete-btn" type="button" onclick="deleteStudent(${student.id})">🗑️ Hapus</button>
        </div>
      `;
      studentList.appendChild(item);
    });
  }

  updateStats();
}

// Menghitung & Menampilkan Statistik
function updateStats() {
  const total = students.length;
  totalStudentsEl.textContent = total;

  if (total === 0) {
    averageScoreEl.textContent = '0';
    return;
  }

  const sum = students.reduce((acc, curr) => acc + curr.score, 0);
  const avg = sum / total;
  // Menampilkan angka desimal maksimal 1 angka dibelakang koma jika ada desimal
  averageScoreEl.textContent = Number.isInteger(avg) ? avg : avg.toFixed(1);
}

// Menampilkan Notifikasi Alert
function showAlert(message, type) {
  if (alertTimeout) clearTimeout(alertTimeout);

  alertMessage.innerHTML = `<div class="alert alert-${type}">${message}</div>`;

  // Otomatis menghilangkan alert setelah 3 detik
  alertTimeout = setTimeout(() => {
    alertMessage.innerHTML = '';
  }, 3000);
}