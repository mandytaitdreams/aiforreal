import DOMPurify from "dompurify";

// Strict allowlist: no scripts, no event handlers, no inline styles via on*, no iframes/objects.
// Permits common rich-text + structural HTML for toolkits.
const CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "a","p","br","hr","span","div","section","article","header","footer",
    "h1","h2","h3","h4","h5","h6",
    "ul","ol","li","dl","dt","dd",
    "strong","em","b","i","u","s","mark","small","sub","sup","blockquote","code","pre","kbd",
    "table","thead","tbody","tfoot","tr","th","td","caption",
    "img","figure","figcaption",
    "details","summary",
  ],
  ALLOWED_ATTR: ["href","title","alt","src","target","rel","colspan","rowspan","class","id","width","height","loading"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ["script","style","iframe","object","embed","form","input","button","textarea","select","link","meta"],
  FORBID_ATTR: ["style","onerror","onload","onclick","onmouseover","onfocus","onblur","onchange","onsubmit","srcdoc","formaction"],
  ADD_ATTR: ["target","rel"],
};

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  const clean = DOMPurify.sanitize(dirty, CONFIG) as unknown as string;
  // Force safe link defaults
  return clean.replace(/<a\s/gi, '<a rel="noopener noreferrer nofollow" target="_blank" ');
}