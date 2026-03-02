import { InlineKeyboard } from "grammy";

export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🇺🇦 Українська", "s:lang:uk")
    .text("🇬🇧 English", "s:lang:en")
    .row()
    .text("Русский", "s:lang:ru");
}

export function targetLanguageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🇬🇧 English", "s:target:en")
    .text("🇺🇦 Українська", "s:target:uk")
    .row()
    .text("🇩🇪 Deutsch", "s:target:de")
    .text("🇫🇷 Français", "s:target:fr")
    .row()
    .text("🇪🇸 Español", "s:target:es")
    .text("🇵🇱 Polski", "s:target:pl")
    .row()
    .text("Русский", "s:target:ru");
}

export function flashcardKeyboard(wordId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("Показати переклад 👀", `fc:show:${wordId}`)
    .row()
    .text("Знаю ✅", `fc:know:${wordId}`)
    .text("Складно 🔄", `fc:hard:${wordId}`);
}

export function flashcardRevealedKeyboard(wordId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("Знаю ✅", `fc:know:${wordId}`)
    .text("Складно 🔄", `fc:hard:${wordId}`)
    .row()
    .text("Видалити 🗑", `fc:delete:${wordId}`);
}

export function methodKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("📬 Пуш-картки", "l:method:flashcard");
}

export function frequencyKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("Щохвилини (тест)", "l:freq:1min")
    .row()
    .text("Кожні 5 хвилин", "l:freq:5min")
    .row()
    .text("Кожні 30 хвилин", "l:freq:30min")
    .row()
    .text("Рандомно (5-60 хв)", "l:freq:random");
}

export function wordListKeyboard(
  words: Array<{ id: number; original: string; translation: string }>,
  page: number,
  totalPages: number
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const word of words) {
    kb.text(`🗑 ${word.original}`, `w:delete:${word.id}`).row();
  }

  if (totalPages > 1) {
    if (page > 0) {
      kb.text("⬅️", `w:page:${page - 1}`);
    }
    kb.text(`${page + 1}/${totalPages}`, "noop");
    if (page < totalPages - 1) {
      kb.text("➡️", `w:page:${page + 1}`);
    }
  }

  return kb;
}

export function settingsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🌐 Мова інтерфейсу", "s:changelang")
    .row()
    .text("🎯 Мова вивчення", "s:changetarget");
}
