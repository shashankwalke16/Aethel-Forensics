document.addEventListener('DOMContentLoaded', () => {
  // Evidence File Data Definitions
  const evidenceFiles = {
    'backup_encrypted.dat': {
      filename: 'backup_encrypted.dat',
      size: '284 Bytes',
      sector: 'Sector 0x004E0',
      type: 'Encrypted Stream Archive',
      path: 'data/backup_encrypted.dat',
      rawText: `EAARERcSbgcZFhgKYhAUFgoXAQwWGgAReBkcGDhzU0UmeRAgNGVuCRcSfm0CAgQbc25wfFgMOiQsICBlEnVKUCo1NjczKycqNnUQMF9AXlM3PCZPHS8rNzkhPC0IEGdYKDctMjx/Gi0qMDIrEnFRQiwrYm0TDxpobGd6VThkU0QkPDZlGjA9MWJ1Ym8cABwCbWh3dXJ3DSoqMHMJU0VeQmMKJzckOjxsUhArK0BRUUImPWIIMyw6ICp1BT5HXEYWFzYpIDxlbi05JjsARAJtDiVgI3UwbC1yPGc2blQEUzwFNSMiaH8NER4uNW9AA1xFcjodPWItETYsZDA0S29cBjdqHXdibXg4Ug==`
    },
    'sticky_note_scan.txt': {
      filename: 'sticky_note_scan.txt',
      size: '512 Bytes',
      sector: 'Sector 0x004F2',
      type: 'Text File (Recovered Memo)',
      path: 'data/sticky_note_scan.txt',
      rawText: `===================================================================
DIGITAL EVIDENCE EXTRACTION - ARTIFACT ITEM E-02
RECOVERED MEMO / STICKY NOTE (SURFACE ADHESIVE ATTACHMENT)
===================================================================

TODO LIST & NOTES:

1. Export DB schema & configuration to offsite storage node.
2. Verify firewall rule allowing incoming traffic on SSH port 22022.
3. Default Vault Session Auth Token / Key identifier:
   CYBER_NEXUS_2026
4. Wipe local staging logs after exfiltration transfer completes.
5. Remind Alex: Replace corrupted RAID drive 2 on target host.

-------------------------------------------------------------------
[ Note physical description: 3x3 yellow adhesive paper found ]
[ attached to outer casing of damaged flash memory controller ]
===================================================================`
    }
  };

  let activeFileId = 'backup_encrypted.dat';
  let currentViewMode = 'raw'; // 'raw' or 'hex'

  // DOM Elements
  const fileContentElement = document.getElementById('file-content');
  const activeFileNameElement = document.getElementById('active-file-name');
  const activeFileMetaElement = document.getElementById('active-file-meta');
  const copyBtn = document.getElementById('copy-content-btn');
  const rawViewTab = document.getElementById('tab-raw-view');
  const hexViewTab = document.getElementById('tab-hex-view');
  const evidenceItems = document.querySelectorAll('.evidence-item');

  // Decryption Console DOM Elements
  const decryptTargetInput = document.getElementById('decrypt-target');
  const decryptKeyInput = document.getElementById('decrypt-key');
  const decryptMethodSelect = document.getElementById('decrypt-method');
  const decryptBtn = document.getElementById('btn-run-decrypt');
  const decryptedOutputElement = document.getElementById('decrypted-output');
  const copyDecryptedBtn = document.getElementById('copy-decrypted-btn');

  // Format string as formatted Hex View
  function generateHexDump(str) {
    const lines = [];
    let offset = 0;
    
    // Convert string to bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hexParts = [];
      const asciiParts = [];

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          hexParts.push(byte.toString(16).padStart(2, '0').toUpperCase());
          // Printable ASCII check
          asciiParts.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
        } else {
          hexParts.push('  ');
          asciiParts.push(' ');
        }
      }

      const offsetHex = offset.toString(16).padStart(8, '0').toUpperCase();
      const hexGroup1 = hexParts.slice(0, 8).join(' ');
      const hexGroup2 = hexParts.slice(8, 16).join(' ');
      const asciiStr = asciiParts.join('');

      lines.push(`${offsetHex}  ${hexGroup1}  ${hexGroup2}  |${asciiStr}|`);
      offset += 16;
    }

    return lines.join('\n');
  }

  // Update File Viewer display
  function renderFileViewer() {
    const file = evidenceFiles[activeFileId];
    if (!file) return;

    activeFileNameElement.textContent = file.filename;
    activeFileMetaElement.textContent = `${file.size} | ${file.sector} | ${file.type}`;

    if (currentViewMode === 'hex') {
      fileContentElement.textContent = generateHexDump(file.rawText);
    } else {
      fileContentElement.textContent = file.rawText;
    }

    // Also update decryption target input
    if (decryptTargetInput) {
      decryptTargetInput.value = file.filename;
    }
  }

  // Handle Evidence Selection
  evidenceItems.forEach(item => {
    item.addEventListener('click', () => {
      evidenceItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      activeFileId = item.dataset.fileId;
      renderFileViewer();
    });
  });

  // Handle View Mode Tabs
  if (rawViewTab) {
    rawViewTab.addEventListener('click', () => {
      currentViewMode = 'raw';
      rawViewTab.classList.add('active');
      if (hexViewTab) hexViewTab.classList.remove('active');
      renderFileViewer();
    });
  }

  if (hexViewTab) {
    hexViewTab.addEventListener('click', () => {
      currentViewMode = 'hex';
      hexViewTab.classList.add('active');
      if (rawViewTab) rawViewTab.classList.remove('active');
      renderFileViewer();
    });
  }

  // Copy Content Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = fileContentElement.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `;
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }

  // XOR Repeating Key Decryption
  function decryptXOR(base64str, keyStr) {
    try {
      const binaryString = window.atob(base64str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      if (!keyStr) {
        return {
          success: false,
          text: "[!] ERROR: Decryption key cannot be empty. Please enter a valid XOR key."
        };
      }
      
      const decryptedBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        decryptedBytes[i] = bytes[i] ^ keyStr.charCodeAt(i % keyStr.length);
      }
      
      const decoder = new TextDecoder('utf-8');
      const decryptedText = decoder.decode(decryptedBytes);
      
      // Safety check: verify printable ASCII ratio
      let printableCount = 0;
      for (let i = 0; i < decryptedText.length; i++) {
        const code = decryptedText.charCodeAt(i);
        if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
          printableCount++;
        }
      }
      
      const printableRatio = printableCount / decryptedText.length;
      const isPrintable = printableRatio > 0.85;
      
      if (!isPrintable) {
        return {
          success: false,
          text: `[!] WARNING: Decrypted stream contains non-printable binary data (printable ratio: ${(printableRatio * 100).toFixed(1)}%).\nThe decryption key might be incorrect or the method is invalid.\n\nRaw Decrypted Bytes (Hex-Encoded Representation):\n${Array.from(decryptedBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}\n\nGarbled Text Output:\n${decryptedText}`
        };
      }
      
      return {
        success: true,
        text: decryptedText
      };
    } catch (err) {
      return {
        success: false,
        text: "[!] ERROR during Base64 / XOR decoding: " + err.message
      };
    }
  }

  // Execute Decryption button
  if (decryptBtn) {
    decryptBtn.addEventListener('click', () => {
      const file = evidenceFiles[activeFileId];
      if (!file) return;
      
      // If file is sticky note / plaintext
      if (activeFileId === 'sticky_note_scan.txt') {
        decryptedOutputElement.style.color = 'var(--accent-cyan)';
        decryptedOutputElement.textContent = `[INFO] Target artifact '${file.filename}' is not encrypted.\n\nRaw Content:\n${file.rawText}`;
        return;
      }
      
      const method = decryptMethodSelect.value;
      if (method === 'base64') {
        try {
          const decoded = window.atob(file.rawText);
          decryptedOutputElement.style.color = 'var(--accent-cyan)';
          decryptedOutputElement.textContent = `[INFO] Base64 decoding successful. Showing raw decoded binary representation (un-XORed):\n\n${decoded}`;
        } catch (e) {
          decryptedOutputElement.style.color = 'var(--accent-red)';
          decryptedOutputElement.textContent = `[!] ERROR: Base64 decode failed: ${e.message}`;
        }
      } else if (method === 'xor') {
        const key = decryptKeyInput.value.trim();
        const result = decryptXOR(file.rawText, key);
        if (result.success) {
          decryptedOutputElement.style.color = 'var(--accent-emerald)';
        } else {
          decryptedOutputElement.style.color = 'var(--accent-amber)';
        }
        decryptedOutputElement.textContent = result.text;
      }
    });
  }

  // Copy Decrypted Content Button
  if (copyDecryptedBtn) {
    copyDecryptedBtn.addEventListener('click', () => {
      const textToCopy = decryptedOutputElement.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyDecryptedBtn.innerHTML;
        copyDecryptedBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `;
        setTimeout(() => {
          copyDecryptedBtn.innerHTML = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy decrypted content: ', err);
      });
    });
  }

  // Initial render
  renderFileViewer();
});
