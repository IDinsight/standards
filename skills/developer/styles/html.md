# HTML Development Style

Apply with `universal.md` for HTML or rendered markup.

- Prefer semantic elements that match the content and interaction before adding
  generic containers or ARIA roles.
- Maintain a logical heading hierarchy and meaningful landmark structure.
- Associate form controls with accessible names and labels. Surface validation
  and error relationships in markup, not only visually.
- Give buttons an explicit `type` when default submit behavior could be
  ambiguous.
- Provide meaningful alternative text for informative images and empty alt text
  for decorative images where appropriate.
- Use links for navigation and buttons for actions. Preserve keyboard operation
  and focus behavior.
- Do not rely on color, placeholder text, hover state, or visual position as the
  only way to communicate meaning.
- Keep document metadata, language, and encoding correct when Developer owns the
  document shell.
- Avoid invalid nesting and unnecessary wrapper markup.
