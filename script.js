document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const nisnInput = document.getElementById('nisnInput');
    const scoreDisplay = document.getElementById('score-display');
    const scoreTableBody = document.getElementById('scoreTableBody');
    const errorMessage = document.getElementById('errorMessage');

    const SPREADSHEET_ID = '1P7ppsieVzXcbpNfqI0X_obSCpN3fUJIe9AEHIKmaJFo';
    const SHEET_NAME = 'AT7';

    loginButton.addEventListener('click', async () => {
        const nisn = nisnInput.value.trim();
        if (nisn === '') {
            errorMessage.textContent = 'Harap masukkan NISN Anda.';
            scoreDisplay.style.display = 'none';
            return;
        }

        errorMessage.textContent = ''; // Hapus pesan error sebelumnya
        scoreTableBody.innerHTML = ''; // Kosongkan tabel sebelum memuat data baru

        try {
            // Menggunakan Google Sheets API v4
            // Perhatian: Untuk deployment di GitHub Pages, Anda perlu mengamankan kunci API Anda.
            // Cara yang lebih aman adalah menggunakan backend serverless seperti Google Cloud Functions
            // untuk mengambil data dari Google Sheets.
            // Untuk tujuan demonstrasi dan pembelajaran, kita akan memanggilnya langsung.
            // Anda perlu mengaktifkan Google Sheets API di Google Cloud Console
            // dan membuat kunci API (API key) yang dibatasi.
            // GANTI DENGAN KUNCI API ANDA YANG SEBENARNYA!
            const API_KEY = 'AIzaSyCN-0307JYEa8VjjX7DYEKeMX5pMIE61S0'; // <<< GANTI INI DENGAN KUNCI API ASLI ANDA

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Gagal mengambil data: ${response.statusText}`);
            }

            const data = await response.json();
            const values = data.values;

            if (!values || values.length < 3) {
                errorMessage.textContent = 'Data tidak ditemukan atau format spreadsheet tidak sesuai.';
                scoreDisplay.style.display = 'none';
                return;
            }

            // Asumsi header di row 2 (index 1), data di row 3 (index 2) dan seterusnya
            const headers = values[1]; // Baris kedua adalah header
            const studentData = values.slice(2); // Data mulai dari baris ketiga

            let foundStudent = false;
            let rowNumber = 1;

            studentData.forEach((row) => {
                // Asumsi kolom NISN ada di salah satu kolom header, kita perlu mencarinya
                // Untuk contoh ini, kita asumsikan NISN ada di kolom tertentu
                // Anda perlu menyesuaikan indeks kolom berdasarkan struktur spreadsheet Anda.
                // Misal, jika NISN ada di kolom ketiga (indeks 2)
                const nisnFromSheet = row[2]; // Ganti indeks ini jika kolom NISN berbeda di spreadsheet Anda
                const studentName = row[0]; // Asumsi Nama Lengkap di kolom pertama
                const studentClass = row[3]; // Asumsi Kelas di kolom keempat
                const studentScore = row[4]; // Asumsi Nilai di kolom kelima

                if (nisnFromSheet && nisnFromSheet.toString() === nisn) {
                    foundStudent = true;
                    let score = parseInt(studentScore, 10);
                    // Pembulatan nilai terdekat
                    score = Math.round(score);

                    const newRow = scoreTableBody.insertRow();
                    newRow.insertCell().textContent = rowNumber++; // Kolom NOMOR
                    newRow.insertCell().textContent = studentName;
                    newRow.insertCell().textContent = nisnFromSheet;
                    newRow.insertCell().textContent = studentClass;
                    newRow.insertCell().textContent = score;

                    // Implementasi highlight merah jika ada nilai yang "salah"
                    // Logika ini perlu disesuaikan dengan kriteria "salah" Anda.
                    // Misalnya, jika ada nilai kunci jawaban di spreadsheet dan nilai siswa berbeda.
                    // Untuk contoh ini, kita hanya akan highlight secara demonstratif.
                    // Jika Anda memiliki kolom kunci jawaban, Anda akan membandingkannya di sini.
                    // Contoh sederhana: jika nilai di bawah 70 dianggap perlu highlight
                    if (score < 75) { // Contoh kondisi: nilai di bawah 70 di-highlight merah
                        newRow.cells[4].classList.add('highlight-red');
                    }
                }
            });

            if (foundStudent) {
                scoreDisplay.style.display = 'block';
            } else {
                errorMessage.textContent = 'NISN tidak ditemukan. Silakan coba lagi.';
                scoreDisplay.style.display = 'none';
            }

        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = `Terjadi kesalahan saat mengambil data: ${error.message}`;
            scoreDisplay.style.display = 'none';
        }
    });
});
