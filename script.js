document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const nisnInput = document.getElementById('nisnInput');
    const scoreDisplay = document.getElementById('score-display');
    const scoreTableBody = document.getElementById('scoreTableBody');
    const errorMessage = document.getElementById('errorMessage');

    const SPREADSHEET_ID = '1P7ppsieVzXcbpNfqI0X_obSCpN3fUJIe9AEHIKmaJFo';
    const SHEET_NAME = 'AT7';

    // GANTI DENGAN KUNCI API ANDA YANG SEBENARNYA!
    const API_KEY = 'GANTI_DENGAN_KUNCI_API_ANDA'; // <<< GANTI INI DENGAN KUNCI API ASLI ANDA

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

            // Asumsi header di row 2 (indeks 1), data di row 3 (indeks 2) dan seterusnya
            // const headers = values[1]; // Jika Anda ingin menggunakan header secara dinamis
            const studentData = values.slice(2); // Data mulai dari baris ketiga

            let rowNumber = 1;
            let nisnFound = false; // Flag untuk memeriksa apakah NISN yang dicari ditemukan

            // Iterasi melalui semua data yang diambil, bukan hanya yang cocok dengan NISN
            studentData.forEach((row) => {
                // Pastikan baris memiliki cukup kolom sebelum mengakses indeks
                if (row.length < 5) { // Asumsi minimal 5 kolom: Nama, NISN, Kelas, Nilai, Kunci Jawaban
                    // Bisa log error atau abaikan baris yang tidak lengkap
                    console.warn('Baris data tidak lengkap:', row);
                    return; // Lewati baris ini
                }

                // SESUAIKAN INDEKS KOLOM INI DENGAN STRUKTUR SPREADSHEET ANDA
                const studentName = row[0];        // Asumsi Kolom A: NAMA LENGKAP
                const nisnFromSheet = row[1];      // Asumsi Kolom B: NISN
                const studentClass = row[2];       // Asumsi Kolom C: KELAS
                const studentScoreRaw = row[3];    // Asumsi Kolom D: NILAI
                const correctAnswerRaw = row[4];   // Asumsi Kolom E: KUNCI JAWABAN (jika ada)

                // Konversi nilai ke angka dan bulatkan
                let studentScore = parseInt(studentScoreRaw, 10);
                if (isNaN(studentScore)) studentScore = 0; // Atasi jika bukan angka
                studentScore = Math.round(studentScore);

                let correctAnswer = parseInt(correctAnswerRaw, 10);
                if (isNaN(correctAnswer)) correctAnswer = 0; // Atasi jika bukan angka

                // Hanya tampilkan baris jika NISN yang dimasukkan cocok
                // Jika Anda ingin menampilkan SEMUA data (1-40) setelah login,
                // dan hanya menyoroti NISN yang cocok, maka ubah logika ini.
                if (nisnFromSheet && nisnFromSheet.toString() === nisn) {
                    nisnFound = true; // NISN ditemukan

                    const newRow = scoreTableBody.insertRow();
                    newRow.insertCell().textContent = rowNumber; // Kolom NOMOR (ini akan berlanjut sesuai jumlah data)
                    newRow.insertCell().textContent = studentName;
                    newRow.insertCell().textContent = nisnFromSheet;
                    newRow.insertCell().textContent = studentClass;
                    newRow.insertCell().textContent = studentScore;

                    // Logika highlight merah: jika nilai siswa TIDAK SAMA dengan kunci jawaban
                    if (studentScore !== correctAnswer) {
                        newRow.cells[4].classList.add('highlight-red'); // Kolom NILAI
                    }

                    // Increment rowNumber hanya untuk baris yang ditampilkan/diproses
                    rowNumber++;
                }
            });

            if (nisnFound) {
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
