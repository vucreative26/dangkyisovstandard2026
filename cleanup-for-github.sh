#!/bin/bash
# Script xóa file không cần thiết trước khi push lên GitHub

echo "🧹 Đang dọn dẹp file không cần thiết..."

# Xóa file backup/temp
rm -f code_gs.text
rm -f code_gs_improved.text
rm -f login-production.html
rm -f DOCUMENTATION.md

# Xóa file hệ thống
rm -f .DS_Store
rm -rf .vscode/

# Xóa file config-local.js (đã có trong .gitignore nhưng xóa cho chắc)
rm -f config-local.js

echo "✅ Đã xóa xong!"
echo ""
echo "📋 File còn lại sẽ được upload lên GitHub:"
echo "   - 5 HTML files"
echo "   - 7 JS files (bao gồm config-public.js và config-secure.js)"
echo "   - 2 CSS files"
echo "   - 2 Backend files (auth-api.php, .htaccess)"
echo "   - 1 Assets folder"
echo "   - README.md và .gitignore"
echo ""
echo "🚀 Bây giờ bạn có thể:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push"
