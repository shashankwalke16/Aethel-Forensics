(function(){const d=document.createElement("link").relList;if(d&&d.supports&&d.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))y(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const a of c.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&y(a)}).observe(document,{childList:!0,subtree:!0});function m(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function y(o){if(o.ep)return;o.ep=!0;const c=m(o);fetch(o.href,c)}})();document.addEventListener("DOMContentLoaded",()=>{const C={"backup_encrypted.dat":{filename:"backup_encrypted.dat",size:"284 Bytes",sector:"Sector 0x004E0",type:"Encrypted Stream Archive",path:"data/backup_encrypted.dat",rawText:"EAARERcSbgcZFhgKYhAUFgoXAQwWGgAReBkcGDhzU0UmeRAgNGVuCRcSfm0CAgQbc25wfFgMOiQsICBlEnVKUCo1NjczKycqNnUQMF9AXlM3PCZPHS8rNzkhPC0IEGdYKDctMjx/Gi0qMDIrEnFRQiwrYm0TDxpobGd6VThkU0QkPDZlGjA9MWJ1Ym8cABwCbWh3dXJ3DSoqMHMJU0VeQmMKJzckOjxsUhArK0BRUUImPWIIMyw6ICp1BT5HXEYWFzYpIDxlbi05JjsARAJtDiVgI3UwbC1yPGc2blQEUzwFNSMiaH8NER4uNW9AA1xFcjodPWItETYsZDA0S29cBjdqHXdibXg4Ug=="},"sticky_note_scan.txt":{filename:"sticky_note_scan.txt",size:"512 Bytes",sector:"Sector 0x004F2",type:"Text File (Recovered Memo)",path:"data/sticky_note_scan.txt",rawText:`===================================================================
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
===================================================================`}};let d="backup_encrypted.dat",m="raw";const y=document.getElementById("file-content"),o=document.getElementById("active-file-name"),c=document.getElementById("active-file-meta"),a=document.getElementById("copy-content-btn"),g=document.getElementById("tab-raw-view"),h=document.getElementById("tab-hex-view"),A=document.querySelectorAll(".evidence-item"),R=document.getElementById("decrypt-target"),k=document.getElementById("decrypt-key"),L=document.getElementById("decrypt-method"),B=document.getElementById("btn-run-decrypt"),i=document.getElementById("decrypted-output"),x=document.getElementById("copy-decrypted-btn");function M(e){const t=[];let r=0;const E=new TextEncoder().encode(e);for(let p=0;p<E.length;p+=16){const I=E.slice(p,p+16),s=[],f=[];for(let w=0;w<16;w++)if(w<I.length){const b=I[w];s.push(b.toString(16).padStart(2,"0").toUpperCase()),f.push(b>=32&&b<=126?String.fromCharCode(b):".")}else s.push("  "),f.push(" ");const T=r.toString(16).padStart(8,"0").toUpperCase(),S=s.slice(0,8).join(" "),n=s.slice(8,16).join(" "),u=f.join("");t.push(`${T}  ${S}  ${n}  |${u}|`),r+=16}return t.join(`
`)}function v(){const e=C[d];e&&(o.textContent=e.filename,c.textContent=`${e.size} | ${e.sector} | ${e.type}`,m==="hex"?y.textContent=M(e.rawText):y.textContent=e.rawText,R&&(R.value=e.filename))}A.forEach(e=>{e.addEventListener("click",()=>{A.forEach(t=>t.classList.remove("active")),e.classList.add("active"),d=e.dataset.fileId,v()})}),g&&g.addEventListener("click",()=>{m="raw",g.classList.add("active"),h&&h.classList.remove("active"),v()}),h&&h.addEventListener("click",()=>{m="hex",h.classList.add("active"),g&&g.classList.remove("active"),v()}),a&&a.addEventListener("click",()=>{const e=y.textContent;navigator.clipboard.writeText(e).then(()=>{const t=a.innerHTML;a.innerHTML=`
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `,setTimeout(()=>{a.innerHTML=t},2e3)}).catch(t=>{console.error("Failed to copy: ",t)})});function O(e,t){try{const r=window.atob(e),l=r.length,E=new Uint8Array(l);for(let n=0;n<l;n++)E[n]=r.charCodeAt(n);if(!t)return{success:!1,text:"[!] ERROR: Decryption key cannot be empty. Please enter a valid XOR key."};const p=new Uint8Array(l);for(let n=0;n<l;n++)p[n]=E[n]^t.charCodeAt(n%t.length);const s=new TextDecoder("utf-8").decode(p);let f=0;for(let n=0;n<s.length;n++){const u=s.charCodeAt(n);(u>=32&&u<=126||u===10||u===13||u===9)&&f++}const T=f/s.length;return T>.85?{success:!0,text:s}:{success:!1,text:`[!] WARNING: Decrypted stream contains non-printable binary data (printable ratio: ${(T*100).toFixed(1)}%).
The decryption key might be incorrect or the method is invalid.

Raw Decrypted Bytes (Hex-Encoded Representation):
${Array.from(p).map(n=>n.toString(16).padStart(2,"0").toUpperCase()).join(" ")}

Garbled Text Output:
${s}`}}catch(r){return{success:!1,text:"[!] ERROR during Base64 / XOR decoding: "+r.message}}}B&&B.addEventListener("click",()=>{const e=C[d];if(!e)return;if(d==="sticky_note_scan.txt"){i.style.color="var(--accent-cyan)",i.textContent=`[INFO] Target artifact '${e.filename}' is not encrypted.

Raw Content:
${e.rawText}`;return}const t=L.value;if(t==="base64")try{const r=window.atob(e.rawText);i.style.color="var(--accent-cyan)",i.textContent=`[INFO] Base64 decoding successful. Showing raw decoded binary representation (un-XORed):

${r}`}catch(r){i.style.color="var(--accent-red)",i.textContent=`[!] ERROR: Base64 decode failed: ${r.message}`}else if(t==="xor"){const r=k.value.trim(),l=O(e.rawText,r);l.success?i.style.color="var(--accent-emerald)":i.style.color="var(--accent-amber)",i.textContent=l.text}}),x&&x.addEventListener("click",()=>{const e=i.textContent;navigator.clipboard.writeText(e).then(()=>{const t=x.innerHTML;x.innerHTML=`
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `,setTimeout(()=>{x.innerHTML=t},2e3)}).catch(t=>{console.error("Failed to copy decrypted content: ",t)})}),v()});
