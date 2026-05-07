maKhachInput.addEventListener('input', async function() {
    const maKhach = this.value.trim().toUpperCase();
    
    // Chỉ bắt đầu tìm khi nhập đủ từ 4 ký tự trở lên (ví dụ: TVV1)
    if (maKhach.length < 4) {
        // Không gọi reset ở đây để tránh mất dữ liệu khi đang gõ dở
        return; 
    }

    statusMsg.innerText = "Đang kiểm tra...";
    statusMsg.style.color = "blue";

    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkMa&maKhach=${maKhach}`);
        const result = await response.json();

        if (result.success) {
            // ĐIỂM QUAN TRỌNG: Gán giá trị và giữ nguyên display block
            tenSpaInput.value = result.tenSpa;
            statusMsg.innerText = "✓ Đã xác thực Spa: " + result.tenSpa;
            statusMsg.style.color = "green";
            additionalFields.style.display = "block"; 
            window.userData = result; 
        } else {
            // Chỉ xóa khi hệ thống báo chắc chắn không thấy mã
            statusMsg.innerText = "✗ Không tìm thấy mã.";
            statusMsg.style.color = "red";
            // additionalFields.style.display = "none"; // Cân nhắc giữ nguyên để user không bị khó chịu
        }
    } catch (e) {
        console.error("Lỗi kết nối:", e);
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
