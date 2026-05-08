#!/bin/bash
# Script tự động chuyển sang chế độ GitHub Pages

echo "🔄 Đang chuyển sang chế độ GITHUB PAGES..."
echo ""

# Backup file gốc
cp login.html login.html.bak
cp admin.html admin.html.bak

# Đổi login.html sang config-public.js
sed -i.tmp 's/config-secure\.js/config-public.js/g' login.html
sed -i.tmp 's/config-local\.js/config-public.js/g' login.html

# Đổi admin.html sang config-public.js
sed -i.tmp 's/config-secure\.js/config-public.js/g' admin.html
sed -i.tmp 's/config-local\.js/config-public.js/g' admin.html

# Xóa file tạm
rm -f login.html.tmp admin.html.tmp

echo "✅ Đã chuyển sang chế độ GitHub Pages!"
echo ""
echo "📋 Thay đổi:"
echo "   - login.html: Dùng config-public.js"
echo "   - admin.html: Dùng config-public.js"
echo ""
echo "🔐 Tài khoản demo:"
echo "   - Username: demo"
echo "   - Password: demo123"
echo ""
echo "⚠️  LƯU Ý: Mật khẩu sẽ công khai trên GitHub!"
echo ""
echo "🚀 Bây giờ bạn có thể:"
echo "   git add ."
echo "   git commit -m 'Switch to GitHub Pages mode'"
echo "   git push"
