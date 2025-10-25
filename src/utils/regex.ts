export function escapeRegExp(text: string) {
  // https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
  return text.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&");
}

export const newRegExp = (str: string, sensitive: string = "") =>
  sensitive ? new RegExp(`^${escapeRegExp(str)}$`, sensitive) : new RegExp(`^${escapeRegExp(str)}$`);
