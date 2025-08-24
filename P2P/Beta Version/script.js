  // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Helpers
    const byId = (id)=>document.getElementById(id);
    const imgInput = byId('imgInput');
    const pdfInput = byId('pdfInput');
    const imgName = byId('imgName');
    const output = byId('output');

    // Drag & drop for PNG
    ;['dragenter','dragover'].forEach(evt=>byId('pngDrop').addEventListener(evt, e=>{
      e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#38bdf8';
    }));
    ;['dragleave','drop'].forEach(evt=>byId('pngDrop').addEventListener(evt, e=>{
      e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'rgba(148,163,184,.35)';
      if(evt==='drop'){ const f = e.dataTransfer.files?.[0]; if(f && f.type==='image/png'){ imgInput.files = e.dataTransfer.files; imgName.textContent = f.name; } }
    }));
    imgInput.addEventListener('change', ()=>{ imgName.textContent = imgInput.files?.[0]?.name || ''; });

    // Drag & drop for PDF
    ;['dragenter','dragover'].forEach(evt=>byId('pdfDrop').addEventListener(evt, e=>{
      e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#38bdf8';
    }));
    ;['dragleave','drop'].forEach(evt=>byId('pdfDrop').addEventListener(evt, e=>{
      e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'rgba(148,163,184,.35)';
      if(evt==='drop'){ const f = e.dataTransfer.files?.[0]; if(f && f.type==='application/pdf'){ pdfInput.files = e.dataTransfer.files; } }
    }));

    // PNG → PDF
    byId('convertToPDF').onclick = async () => {
      const file = imgInput.files?.[0];
      if (!file) return alert("Please select a PNG file first.");

      const { jsPDF } = window.jspdf;
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgData = e.target.result;

        // Create a PDF sized to the image while keeping it on A4 if it fits
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const a4w = pdf.internal.pageSize.getWidth();
        const a4h = pdf.internal.pageSize.getHeight();

        const img = new Image();
        img.onload = () => {
          const iw = img.width, ih = img.height;
          // Fit image into A4 with aspect ratio preserved and 36pt margin
          const margin = 36;
          const maxW = a4w - margin*2, maxH = a4h - margin*2;
          const ratio = Math.min(maxW/iw, maxH/ih);
          const w = iw*ratio, h = ih*ratio;
          const x = (a4w - w)/2, y = (a4h - h)/2;

          pdf.addImage(imgData, 'PNG', x, y, w, h);
          pdf.save((file.name.replace(/\.png$/i,'') || 'image') + ".pdf");
        };
        img.src = imgData;
      };
      reader.readAsDataURL(file);
    };

    byId('clearImg').onclick = ()=>{ imgInput.value = ''; imgName.textContent=''; };

    // PDF → PNG
    byId('convertToPNG').onclick = () => {
      const file = pdfInput.files?.[0];
      if (!file) return alert("Please select a PDF file first.");

      const reader = new FileReader();
      reader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        output.innerHTML = "";

        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
          for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(page => {
              const scale = 1.5;
              const viewport = page.getViewport({ scale });

              // Container for each page
              const wrap = document.createElement('div');
              wrap.className = 'page';

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              page.render({ canvasContext: ctx, viewport }).promise.then(() => {
                // Footer with page number + download button
                const footer = document.createElement('div');
                footer.className = 'page-footer';

                const label = document.createElement('div');
                label.textContent = `Page ${i}`;

                const btn = document.createElement('button');
                btn.className = 'btn-ghost';
                btn.textContent = 'Download PNG';
                btn.onclick = () => {
                  const link = document.createElement('a');
                  link.download = `page-${i}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                };

                wrap.appendChild(canvas);
                footer.appendChild(label);
                footer.appendChild(btn);
                wrap.appendChild(footer);
                output.appendChild(wrap);
              });
            });
          }
        }).catch(err => alert("Failed to read PDF: " + err.message));
      };
      reader.readAsArrayBuffer(file);
    };

    byId('clearPdf').onclick = ()=>{ pdfInput.value=''; output.innerHTML=''; };