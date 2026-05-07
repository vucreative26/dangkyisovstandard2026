const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo4Eyjnkc5uhG173fYPUycDaWXn1vd2ltpezVhJFvbFbjxklMtisk2ibGyDulNw94O/exec"

document.getElementById('fileUpload').addEventListener('change', function(e) {
    const count = e.target.files.length;
    document.getElementById('fileCount').innerText = count > 0 ? `Đã chọn ${count} tệp` : 'Chọn tệp (2-20 file)';
});

document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const files = document.getElementById('fileUpload').files;

    if (files.length < 2 || files.length > 20) {
        alert("Vui lòng chọn từ 2 đến 20 file hồ sơ.");
        return;
    }

    submitBtn.innerText = "ĐANG TẢI LÊN...";
    submitBtn.disabled = true;

    try {
        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: e.target.result.split(',')[1]
                });
                reader.readAsDataURL(file);
            });
        });

        const fileData = await Promise.all(filePromises);

        const payload = {
            team: document.getElementById('teamPhuTrach').value,
            sale: document.getElementById('salePhuTrach').value,
            tenSpa: document.getElementById('tenSpa').value,
            tenKhach: document.getElementById('tenKhachHang').value,
            maKhach: document.getElementById('maKhachHang').value,
            files: fileData
        };

        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });

        alert("Đã gửi thông tin! Trạng thái: Đã upload.");
        document.getElementById('registrationForm').reset();
        document.getElementById('fileCount').innerText = 'Chọn tệp (2-20 file)';

    } catch (error) {
        alert("Lỗi: " + error.message);
    } finally {
        submitBtn.innerText = "GỬI THÔNG TIN ĐĂNG KÝ";
        submitBtn.disabled = false;
    }
});