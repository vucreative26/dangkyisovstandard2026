// 1. CẤU HÌNH
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWFN4wIJTxilTdgDXjHzsylT0YWOOtK80xPjU-XiBy79Ngpkimo_Y90a1rUBS9keAX/exec"; 

const maKhachInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');
const fileInput = document.getElementById('fileUpload'); // Đảm bảo ID này khớp với HTML

let typingTimer;
const doneTypingInterval = 500; 

// 2. CHẶN PHÍM ENTER
document.getElementById('reviewForm').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        return false;
    }
});

// 3. TỰ ĐỘNG KIỂM TRA MÃ
maKhachInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    const maKhach = this.value.trim().toUpperCase();
    if (maKhach === "") { resetUI(); return; }

    if (maKhach.length >= 4) {
        statusMsg.innerText = "🔍 Đang kiểm tra mã...";
        statusMsg.style.color = "blue";
        typingTimer = setTimeout(() => { fetchData(maKhach); }, doneTypingInterval);
    }
});

async function fetchData(maKhach) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkMa&maKhach=${maKhach}`);
        const result = await response.json();
        if (result.success) {
            tenSpaInput.value = result.tenSpa;
            statusMsg.innerText = "✅ Xác thực: " + result.tenSpa;
            statusMsg.style.color = "green";
            additionalFields.style.display = "block";
            window.userData = result; 
        } else {
            statusMsg.innerText = "❌ Không tìm thấy mã.";
            statusMsg.style.color = "red";
            additionalFields.style.display = "none";
        }
    } catch (e) { statusMsg.innerText = "⚠️ Lỗi kết nối!"; }
}

function resetUI() {
    tenSpaInput.value = "";
    statusMsg.innerText = "";
    additionalFields.style.display = "none";
}

// 4. LOGIC CHUYỂN ĐỔI FILE SANG BASE64
async function getFilesData(input) {
    const files = input.files;
    const promises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: e.target.result.split(',')[1] // Lấy phần dữ liệu Base64
                });
            };
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(promises);
}

// 5. GỬI FORM
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    if (!window.userData) { alert("Vui lòng xác thực mã trước!"); return; }

    btn.innerText = "ĐANG TẢI ẢNH & GỬI HỒ SƠ...";
    btn.disabled = true;

    try {
        const fileData = await getFilesData(fileInput); // Đọc file ở đây
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value).join(', ');

        const payload = {
            action: "submitReview",
            folderTag: "xet_duyet", // Nhãn để App Script phân loại thư mục
            maKhach: maKhachInput.value.trim().toUpperCase(),
            tenSpa: tenSpaInput.value,
            team: window.userData.team,
            sale: window.userData.sale,
            tenKhach: window.userData.tenKhach,
            soGiuong: document.getElementById('soGiuong').value,
            soNhanSu: document.getElementById('soNhanSu').value,
            lieuTrinhCoBan: document.getElementById('lieuTrinhCoBan').value,
            lieuTrinhNangCao: document.getElementById('lieuTrinhNangCao').value,
            thietBiCoBan: getChecked('deviceBasic'),
            thietBiNangCao: getChecked('deviceAdvanced'),
            bangCap: document.getElementById('bangCap').value,
            files: fileData // Dữ liệu ảnh đã có Base64
        };

        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.status === 'success') {
            alert("Gửi thành công! Ảnh đã được lưu vào thư mục Xét Duyệt.");
            location.reload();
        } else {
            alert("Lỗi: " + data.message);
            btn.disabled = false;
        }
    } catch (err) {
        alert("Lỗi hệ thống khi tải ảnh!");
        btn.disabled = false;
    }
});
