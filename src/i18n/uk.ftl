start-welcome = 👋 Вітаю, { $name }! Я допоможу тобі вивчати нові слова.
start-choose_language = Обери мову інтерфейсу:
start-choose_target = Яку мову ти вивчаєш?
start-setup_complete = ✅ Налаштування завершено! Додай перше слово через /add

words-add_prompt = Напиши слово іноземною мовою:
words-add_translation = Тепер напиши переклад:
words-add_context = Додай приклад речення (або натисни /skip):
words-added = ✅ Слово «{ $word }» додано!
words-empty = У тебе поки немає слів. Додай перше через /add
words-list_header = 📚 Твій словник ({ $count } слів):
words-deleted = 🗑 Слово видалено
words-not_found = Слово не знайдено.
words-import_prompt = Надішли текстовий файл. Формат: одне слово — один рядок, слово та переклад через тире або табуляцію.
words-import_success = ✅ Імпортовано { $count } слів!
words-import_error = Не вдалося розібрати файл. Перевір формат.
words-import_empty = Файл порожній або не містить валідних рядків.
words-export_empty = У тебе немає слів для експорту.
words-export_header = 📤 Твій словник
words-too_long = Слово або переклад занадто довгі. Максимум: 200 / 500 символів.

learn-choose_method = Обери метод вивчення:
learn-flashcard_name = 📬 Пуш-картки
learn-flashcard_desc = Отримуй сповіщення зі словами через встановлені інтервали
learn-choose_frequency = Як часто надсилати слова?
learn-freq_1min = Щохвилини (тест)
learn-freq_5min = Кожні 5 хвилин
learn-freq_30min = Кожні 30 хвилин
learn-freq_random = Рандомно (5-60 хв)
learn-started = 🚀 Вивчення запущено! Очікуй перше слово...
learn-stopped = ⏸ Вивчення зупинено.
learn-no_words = Спочатку додай слова через /add
learn-already_active = У тебе вже є активна сесія. Спочатку зупини її через /stop
learn-no_active_session = У тебе немає активної сесії. Натисни /learn

flashcard-show_translation = Показати переклад 👀
flashcard-know = Знаю ✅
flashcard-hard = Складно 🔄
flashcard-delete_word = Видалити 🗑
flashcard-word_prompt = 📝 «{ $word }»
flashcard-word_with_translation =
    📝 «{ $word }»
    💡 { $translation }
flashcard-all_learned = 🎉 Всі слова вивчено! Додай нові через /add

settings-title = ⚙️ Налаштування
settings-interface_lang = Мова інтерфейсу: { $lang }
settings-target_lang = Мова вивчення: { $lang }
settings-timezone = Часовий пояс: { $tz }
settings-change_interface = Змінити мову інтерфейсу
settings-change_target = Змінити мову вивчення
settings-lang_updated = ✅ Мову оновлено!
settings-target_updated = ✅ Мову вивчення оновлено!

stats-title = 📊 Твоя статистика
stats-total_words = Всього слів: { $count }
stats-learned = Вивчено: { $count }
stats-in_progress = В процесі: { $count }
stats-active_session = Активна сесія: { $method } ({ $frequency })
stats-no_session = Немає активної сесії

help-title = 📖 Доступні команди:
help-start = /start — Почати роботу з ботом
help-add = /add — Додати нове слово
help-words = /words — Переглянути словник
help-learn = /learn — Почати вивчення
help-stop = /stop — Зупинити вивчення
help-settings = /settings — Налаштування
help-stats = /stats — Статистика
help-import = /import — Імпортувати слова з файлу
help-export = /export — Експортувати словник
help-help = /help — Ця довідка

errors-generic = 😔 Щось пішло не так. Спробуй ще раз.
errors-no_active_session = У тебе немає активної сесії. Натисни /learn

languages-uk = 🇺🇦 Українська
languages-en = 🇬🇧 English
