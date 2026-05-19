     // ========================
     // // 1. MARKED configuration (robust)
        // ========================
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,        // line breaks from markdown
                gfm: true,          // github flavored markdown
                headerIds: true,
                mangle: false,
                pedantic: false
            });
        }
        
        // state
        let currentMarkdown = '';
        let currentFileName = '';
        
        // DOM elements
        const readerDiv = document.getElementById('reader');
        const tocContainer = document.getElementById('toc');
        const tocPlaceholder = document.getElementById('toc-placeholder');
        const emptyStateDiv = document.getElementById('empty-state');
        const fileInfoDiv = document.getElementById('file-info');
        const filenameSpan = document.getElementById('filename');
        const currentFileBadge = document.getElementById('current-file');
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        
        // Helper: render full markdown
        function renderMarkdown(mdContent) {
            if (!mdContent) return;
            try {
                // marked.parse returns a Promise if callback omitted, but marked.min.js legacy? use sync version
                let parsedHtml = marked.parse(mdContent);
                // in case it returns a promise (modern versions), handle both.
                if (parsedHtml && typeof parsedHtml.then === 'function') {
                    parsedHtml.then(html => {
                        readerDiv.innerHTML = html;
                        currentMarkdown = mdContent;
                        generateTOCFromDOM();
                        scrollToTopIfNeeded();
                    }).catch(e => {
                        console.warn(e);
                        readerDiv.innerHTML = `<div class="text-red-500 p-4">⚠️ Error parsing markdown</div>${marked.parse(mdContent)}`;
                        currentMarkdown = mdContent;
                        generateTOCFromDOM();
                    });
                } else {
                    readerDiv.innerHTML = parsedHtml;
                    currentMarkdown = mdContent;
                    generateTOCFromDOM();
                }
            } catch (err) {
                console.error(err);
                readerDiv.innerHTML = `<div class="text-red-500 p-4 rounded bg-red-50 dark:bg-red-950/20">⚠️ Could not render markdown: ${err.message}</div>`;
            }
        }
        
        // generate TOC from rendered headings
        function generateTOCFromDOM() {
            if (!readerDiv) return;
            const headings = readerDiv.querySelectorAll('h1, h2, h3, h4');
            tocContainer.innerHTML = '';
            
            if (!headings || headings.length === 0) {
                tocPlaceholder.classList.remove('hidden');
                return;
            }
            tocPlaceholder.classList.add('hidden');
            
            headings.forEach((heading, idx) => {
                // ensure each heading has a stable ID for linking
                let headingId = heading.id;
                if (!headingId || headingId === '') {
                    // generate slug from text or fallback
                    let rawText = heading.textContent.trim() || `heading-${idx}`;
                    headingId = rawText.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                    if (!headingId) headingId = `section-${idx}`;
                    heading.id = headingId;
                }
                
                const level = heading.tagName.toLowerCase();
                let paddingClass = 'pl-3';
                if (level === 'h1') paddingClass = 'pl-2 font-semibold text-[0.85rem]';
                else if (level === 'h2') paddingClass = 'pl-5 text-[0.8rem]';
                else if (level === 'h3') paddingClass = 'pl-7 text-[0.75rem] text-gray-600 dark:text-gray-400';
                else paddingClass = 'pl-8 text-[0.7rem] text-gray-500';
                
                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.textContent = heading.textContent.length > 60 ? heading.textContent.slice(0, 55) + '…' : heading.textContent;
                link.className = `toc-link block py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/70 transition-all text-gray-700 dark:text-gray-200 ${paddingClass}`;
                link.style.cursor = 'pointer';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(heading.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // close sidebar on mobile after click (optional)
                        if (window.innerWidth < 1024) {
                            toggleSidebar(false);
                        }
                    }
                });
                tocContainer.appendChild(link);
            });
        }
        
        // scroll to top helper after new load
        function scrollToTopIfNeeded() {
            const scrollContainer = document.querySelector('.flex-1.overflow-auto');
            if (scrollContainer) scrollContainer.scrollTop = 0;
        }
        
        // core file handler
        function handleFile(file) {
            if (!file) return;
            const validExt = /\.(md|markdown|txt)$/i;
            if (!validExt.test(file.name) && file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
                alert("📄 Please select a Markdown file (.md or .markdown)");
                return;
            }
            
            currentFileName = file.name;
            filenameSpan.textContent = file.name;
            currentFileBadge.innerHTML = `<i class="fa-regular fa-file-lines mr-1.5"></i>${file.name.length > 30 ? file.name.slice(0, 27) + '…' : file.name}`;
            fileInfoDiv.classList.remove('hidden');
            emptyStateDiv.classList.add('hidden');
            
            const fileReader = new FileReader();
            fileReader.onload = (ev) => {
                const content = ev.target.result;
                renderMarkdown(content);
            };
            fileReader.onerror = () => {
                alert("Error reading file. Please try again.");
            };
            fileReader.readAsText(file, 'UTF-8');
        }
        
        // clear file
        function clearFile() {
            readerDiv.innerHTML = '';
            tocContainer.innerHTML = '';
            fileInfoDiv.classList.add('hidden');
            emptyStateDiv.classList.remove('hidden');
            currentFileBadge.innerHTML = `<i class="fa-regular fa-file-lines mr-1.5"></i>No document`;
            currentMarkdown = '';
            currentFileName = '';
            tocPlaceholder.classList.remove('hidden');
            // reset file input value to allow re-upload same file
            fileInput.value = '';
        }
        
        // export as HTML (fully standalone)
        function downloadHTML() {
            if (!currentMarkdown || currentMarkdown.trim() === '') {
                alert("No markdown loaded. Please upload a .md file first.");
                return;
            }
            
            let exportHtmlContent = '';
            try {
                const parsedForExport = marked.parse(currentMarkdown);
                const resolvePromise = (val) => {
                    exportHtmlContent = val;
                    finishDownload(exportHtmlContent);
                };
                if (parsedForExport && typeof parsedForExport.then === 'function') {
                    parsedForExport.then(resolvePromise).catch(() => {
                        exportHtmlContent = marked.parse(currentMarkdown);
                        finishDownload(exportHtmlContent);
                    });
                } else {
                    exportHtmlContent = parsedForExport;
                    finishDownload(exportHtmlContent);
                }
            } catch(e) {
                exportHtmlContent = `<p>Error rendering markdown</p><pre>${escapeHtml(currentMarkdown)}</pre>`;
                finishDownload(exportHtmlContent);
            }
            
            function finishDownload(htmlBody) {
                const titleName = (currentFileName || 'document').replace(/\.(md|markdown|txt)$/i, '');
                const finalDoc = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${escapeHtml(titleName)} · MD Reader Export</title>
                    <style>
                        body { font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 880px; margin: 2rem auto; padding: 2rem; line-height: 1.7; background: #fafafa; color: #1e293b; }
                        h1, h2, h3 { margin-top: 1.8rem; font-weight: 600; }
                        h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3rem; }
                        pre { background: #f1f5f9; padding: 1rem; border-radius: 16px; overflow-x: auto; }
                        code { background: #eef2ff; padding: 0.2rem 0.4rem; border-radius: 8px; font-size: 0.9rem; }
                        blockquote { border-left: 4px solid #3b82f6; margin: 1rem 0; padding-left: 1rem; color: #334155; }
                        a { color: #2563eb; text-decoration: underline; }
                        img { max-width: 100%; border-radius: 12px; }
                        @media (prefers-color-scheme: dark) {
                            body { background: #0f172a; color: #e2e8f0; }
                            pre { background: #1e293b; }
                            code { background: #1e293b; color: #cbd5e1; }
                            blockquote { color: #94a3b8; }
                        }
                    </style>
                </head>
                <body>
                    <main>${htmlBody}</main>
                    <hr style="margin: 3rem 0 1rem; border-color:#e2e8f0;">
                    <footer style="font-size: 0.75rem; text-align: center; color: #64748b;">Exported from MD Reader · ${new Date().toLocaleString()}</footer>
                </body>
                </html>`;
                const blob = new Blob([finalDoc], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${titleName.replace(/[\\/:*?"<>|]/g, '_') || 'markdown_export'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
                return c;
            });
        }
        
        // theme toggler (persist with localStorage)
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            const icon = document.getElementById('theme-icon');
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('mdreader_theme', 'dark');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('mdreader_theme', 'light');
            }
        }
        
        function loadThemePreference() {
            const saved = localStorage.getItem('mdreader_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const icon = document.getElementById('theme-icon');
            if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                document.documentElement.classList.remove('dark');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
        
        function toggleSidebar(forceState) {
            const sidebar = document.getElementById('sidebar');
            if (forceState === false) {
                sidebar.classList.remove('open');
            } else {
                sidebar.classList.toggle('open');
            }
        }
        
        // Event binding and initialization
        window.onload = function() {
            loadThemePreference();
            
            // Drag & Drop setup
            dropZone.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                    handleFile(files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                }
                fileInput.value = '';
            });
            
            // optional: close sidebar on resize if window becomes large (reopen if needed)
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 1024) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
                }
            });
        };
        
        // expose global functions
        window.clearFile = clearFile;
        window.toggleTheme = toggleTheme;
        window.downloadHTML = downloadHTML;
        window.toggleSidebar = toggleSidebar;