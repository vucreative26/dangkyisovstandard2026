const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWFN4wIJTxilTdgDXjHzsylT0YWOOtK80xPjU-XiBy79Ngpkimo_Y90a1rUBS9keAX/exec"; // Dán URL Deployment mới vào đây

const maKhachInput = document.getElementById('maKhachHang');
const tenSpaInput = document.getElementById('tenSpa');
const additionalFields = document.getElementById('additionalFields');
const statusMsg = document.getElementById('statusMsg');

// Tra cứu mã khách hàng
maKhachInput.addEventListener('input', async function() {
    const maKhach = this.value.trim().toUpperCase();
    if (maKhach.length < 3) {
        resetFormStatus();
        return;
    }

    statusMsg.innerText = "Đang kiểm tra...";
    statusMsg.style.color = "blue";

    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkMa&maKhach=${maKhach}`);
        const result = await response.json();

        if (result.success) {
            tenSpaInput.value = result.tenSpa;
            statusMsg.innerText = "✓ Đã xác thực Spa: " + result.tenSpa;
            statusMsg.style.color = "green";
            additionalFields.style.display = "block";
            window.userData = result; 
        } else {
            tenSpaInput.value = "";
            statusMsg.innerText = "✗ Không tìm thấy mã. Vui lòng đăng ký tham gia trước.";
            statusMsg.style.color = "red";
            additionalFields.style.display = "none";
        }
    } catch (e) {
        statusMsg.innerText = "✗ Lỗi kết nối hệ thống.";
    }
});

function resetFormStatus() {
    tenSpaInput.value = "";
    additionalFields.style.display = "none";
    statusMsg.innerText = "";
}

// Xử lý gửi Form
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const files = document.getElementById('fileUpload').files;

    btn.innerText = "ĐANG TẢI DỮ LIỆU...";
    btn.disabled = true;

    try {
        const filePromises = Array.from(files).map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: ev.target.result.split(',')[1]
                });
                reader.readAsDataURL(file);
            });
        });

        const fileData = await Promise.all(filePromises);
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value).join('\n');

        const payload = {
            action: "submitReview",
            maKhach: maKhachInput.value.trim().toUpperCase(),
            tenSpa: tenSpaInput.value,
            team: window.userData.team || "",
            sale: window.userData.sale || "",
            tenKhach: window.userData.tenKhach || "",
            soGiuong: document.getElementById('soGiuong').value,
            soNhanSu: document.getElementById('soNhanSu').value,
            lieuTrinhCoBan: document.getElementById('lieuTrinhCoBan').value,
            lieuTrinhNangCao: document.getElementById('lieuTrinhNangCao').value,
            thietBiCoBan: getChecked('deviceBasic'),
            thietBiNangCao: getChecked('deviceAdvanced'),
            bangCap: document.getElementById('bangCap').value,
            files: fileData
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        alert("Gửi hồ sơ xét duyệt thành công!");
        location.reload();

    } catch (error) {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
        btn.disabled = false;
        btn.innerText = "GỬI THÔNG TIN XÉT DUYỆT";
    }
});