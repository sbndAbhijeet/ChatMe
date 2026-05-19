export const layoutRoutes = [
  {
    pattern: "/chatbot/:id",
    sidebar: true,
    header: false,
    footer: false,
    type: "chat"
  },
  {
    pattern: "/blogs",
    sidebar: true,
    header: false,
    footer: false,
    type: "blog"
  },
  {
    pattern: "/pdfs",
    sidebar: true,
    header: false,
    footer: false,
    type: "pdf"
  },
  {
    pattern: "/create-blog",
    sidebar: true,
    header: false,
    footer: false,
    type: "blog"
  },
  {
    pattern: "/create-note",
    sidebar: true,
    header: false,
    footer: false,
    type: "note"
  },
  {
    pattern: "/settings",
    sidebar: true,
    header: false,
    footer: false,
    type: "settings"
  },
  {
    pattern: "/blogs/:blogId/note/:noteId",
    sidebar: true,
    header: false,
    footer: false,
    type: "note"
  }
];
