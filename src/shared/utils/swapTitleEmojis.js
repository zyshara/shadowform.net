export function swapTitleEmojis(emojiA = "🖤", emojiB = "🩷", interval = 500) {
  return setInterval(() => {
    const title = document.title;

    const indexA = title.indexOf(emojiA);
    const indexB = title.indexOf(emojiB);

    // Only swap if both emojis exist
    if (indexA === -1 || indexB === -1) return;

    // Ensure A comes before B for consistent swapping
    const [firstEmoji, secondEmoji] =
      indexA < indexB ? [emojiA, emojiB] : [emojiB, emojiA];

    document.title = title
      .replace(firstEmoji, "__TMP__")
      .replace(secondEmoji, firstEmoji)
      .replace("__TMP__", secondEmoji);
  }, interval);
}
