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
    pattern: "/blogs/:blogId/note/:noteId",
    sidebar: true,
    header: false,
    footer: false,
    type: "note"
  }
];
