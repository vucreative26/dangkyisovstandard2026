// 1. CẤU HÌNH - Thay URL Web App của bạn vào đây
const SCRIPT_URL = "URL_WEB_APP_MOI_CUA_BAN"; 

const maKhachInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');

// Biến quản lý thời gian chờ gõ (Debounce)
let typingTimer;
const doneTypingInterval = 500; 

// 2. CHẶN PHÍM ENTER GÂY RELOAD TRANG
document.getElementById('reviewForm').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Chặn hành động tải lại trang
        return false;
    }
});

// 3. TỰ ĐỘNG KIỂM TRA MÃ (AUTO-CHECK)
maKhachInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    const maKhach = this.value.trim().toUpperCase();

    if (maKhach === "") {
        resetUI();
        return;
    }

    // Hiện trạng thái đang check ngay khi đủ 4 ký tự (ví dụ VVP1...)
    if (maKhach.length >= 4) {
        statusMsg.innerText = "🔍 Đang kiểm tra mã...";
        statusMsg.style.color = "blue";
        
        typingTimer = setTimeout(() => {
            fetchData(maKhach);
        }, doneTypingInterval);
    } else {
        statusMsg.innerText = "Đang gõ...";
        statusMsg.style.color = "gray";
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
            additionalFields.style.display = "block"; // Hiện form điền tiếp
            window.userData = result; 
        } else {
            tenSpaInput.value = "";
            statusMsg.innerText = "❌ Không tìm thấy mã này.";
            statusMsg.style.color = "red";
            additionalFields.style.display = "none";
        }
    } catch (e) {
        statusMsg.innerText = "⚠️ Lỗi kết nối!";
        statusMsg.style.color = "orange";
    }
}

function resetUI() {
    tenSpaInput.value = "";
    statusMsg.innerText = "";
    additionalFields.style.display = "none";
    window.userData = null;
}

// 4. XỬ LÝ SUBMIT FORM (GỬI DỮ LIỆU)
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Chặn reload trang khi nhấn nút gửi
    
    const btn = document.getElementById('submitBtn');
    if (!window.userData) {
        alert("Vui lòng nhập đúng mã khách hàng trước!");
        return;
    }

    btn.innerText = "ĐANG GỬI HỒ SƠ...";
    btn.disabled = true;

    try {
        // Thu thập các checkbox thiết bị
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                                         .map(cb => cb.value).join(', ');

        const payload = {
            action: "submitReview",
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
            files: [] // Nếu cần upload file, bạn thêm logic đọc FileReader vào đây
        };

        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.status === 'success') {
            alert("Gửi thành công!");
            location.reload();
        } else {
            alert("Lỗi: " + data.message);
            btn.disabled = false;
        }
    } catch (err) {
        alert("Lỗi hệ thống!");
        btn.disabled = false;
    }
});
