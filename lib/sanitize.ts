import sanitizeHtml from "sanitize-html"

export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "p", "ul", "ol", "li",
      "pre", "code", "strong", "em", "a",
      "br", "span", "div", "sub", "sup",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"],
      code: ["class"],
    },
    allowedSchemes: ["https"],
  })
}
