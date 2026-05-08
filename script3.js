// 1. CẤU HÌNH URL APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQI0P_GBnsQFr8dtjSsWoAt59YS9tanlF6aXIIZa2fnbuuRz4xke_9WPwseo_mBm6Z/exec";

// 2. KHAI BÁO CÁC PHẦN TỬ UI
const maInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const statusMsg = document.getElementById('statusMsg');
const checkResult = document.getElementById('checkResult');
const sttDangKy = document.getElementById('sttDangKy');
const sttXetDuyet = document.getElementById('sttXetDuyet');
const finalNote = document.getElementById('finalNote');

let typingTimer;
const doneTypingInterval = 800; // Đợi 0.8s sau khi dừng gõ

// 3. LẮNG NGHE SỰ KIỆN NHẬP MÃ
maInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const code = maInput.value.trim().toUpperCase();
    
    if (!code) {
        resetUI();
        return;
    }

    if (code.length >= 4) {
        statusMsg.textContent = "🔍 Đang tra cứu...";
        statusMsg.style.color = "#3498db";
        typingTimer = setTimeout(() => fetchStatus(code), doneTypingInterval);
    }
});

// 4. HÀM GỌI API TRA CỨU TRẠNG THÁI
async function fetchStatus(code) {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkStatus&maKhach=${code}`);
        const result = await response.json();

        if (result.found) {
            displayFinalResult(result);
        } else {
            showError("Mã thành viên chưa tồn tại trên hệ thống");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        showError("Không thể kết nối máy chủ. Vui lòng thử lại!");
    }
}

// 5. HIỂN THỊ KẾT QUẢ
function displayFinalResult(data) {
    statusMsg.textContent = "✅ Đã tìm thấy thông tin";
    statusMsg.style.color = "#28a745";
    tenSpaInput.value = data.tenSpa;
    checkResult.style.display = "block";

    // Cập nhật badge
    if (data.hasDangKy) {
        sttDangKy.textContent = "✓ Đã hoàn thành";
        sttDangKy.className = "status-badge completed";
    } else {
        sttDangKy.textContent = "✗ Chưa hoàn thành";
        sttDangKy.className = "status-badge not-found";
    }

    if (data.hasXetDuyet) {
        sttXetDuyet.textContent = "✓ Đã hoàn thành";
        sttXetDuyet.className = "status-badge completed";
    } else {
        sttXetDuyet.textContent = "✗ Chưa hoàn thành";
        sttXetDuyet.className = "status-badge not-found";
    }

    // Kết luận
    if (data.hasDangKy && data.hasXetDuyet) {
        finalNote.style.background = "#d4edda";
        finalNote.style.color = "#155724";
        finalNote.style.borderLeft = "5px solid #28a745";
        finalNote.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🎉</span>
                <div>
                    <strong>${data.tenSpa}</strong> đã hoàn thành đầy đủ 2 bước đăng ký!<br>
                    <span style="font-size: 13px; opacity: 0.9;">Phòng đào tạo sẽ thông báo kết quả xét duyệt sớm nhất.</span>
                </div>
            </div>
        `;
    } else if (data.hasDangKy && !data.hasXetDuyet) {
        finalNote.style.background = "#fff3cd";
        finalNote.style.color = "#856404";
        finalNote.style.borderLeft = "5px solid #ffc107";
        finalNote.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                    Bạn đã hoàn thành <strong>Đăng ký tham gia</strong>.<br>
                    Vui lòng tiếp tục hoàn thành <strong>"Đăng ký xét duyệt"</strong> để được đánh giá.
                </div>
            </div>
        `;
    } else {
        finalNote.style.background = "#f8d7da";
        finalNote.style.color = "#721c24";
        finalNote.style.borderLeft = "5px solid #dc3545";
        finalNote.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">❌</span>
                <div>
                    Bạn chưa hoàn thành đăng ký.<br>
                    Vui lòng bắt đầu từ <strong>"Đăng ký tham gia"</strong>.
                </div>
            </div>
        `;
    }
}

// 6. HÀM TIỆN ÍCH
function showError(msg) {
    statusMsg.textContent = "❌ " + msg;
    statusMsg.style.color = "#dc3545";
    checkResult.style.display = "none";
    tenSpaInput.value = "";
}

function resetUI() {
    statusMsg.textContent = "";
    checkResult.style.display = "none";
    tenSpaInput.value = "";
}