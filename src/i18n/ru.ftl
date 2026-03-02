start-welcome = 👋 Привет, { $name }! Я помогу тебе учить новые слова.
start-choose_language = Выбери язык интерфейса:
start-choose_target = Какой язык ты изучаешь?
start-setup_complete = ✅ Настройка завершена! Добавь первое слово через /add

words-add_prompt = Напиши слово на иностранном языке:
words-add_translation = Теперь напиши перевод:
words-add_context = Добавь пример предложения (или нажми /skip):
words-added = ✅ Слово «{ $word }» добавлено!
words-empty = У тебя пока нет слов. Добавь первое через /add
words-list_header = 📚 Твой словарь ({ $count } слов):
words-deleted = 🗑 Слово удалено
words-not_found = Слово не найдено.
words-import_prompt = Отправь текстовый файл. Формат: одно слово на строку, слово и перевод через тире или табуляцию.
words-import_success = ✅ Импортировано { $count } слов!
words-import_error = Не удалось разобрать файл. Проверь формат.
words-import_empty = Файл пуст или не содержит валидных строк.
words-export_empty = У тебя нет слов для экспорта.
words-export_header = 📤 Твой словарь
words-too_long = Слово или перевод слишком длинные. Максимум: 200 / 500 символов.

learn-choose_method = Выбери метод изучения:
learn-flashcard_name = 📬 Пуш-карточки
learn-flashcard_desc = Получай уведомления со словами через заданные интервалы
learn-choose_frequency = Как часто отправлять слова?
learn-freq_1min = Каждую минуту (тест)
learn-freq_5min = Каждые 5 минут
learn-freq_30min = Каждые 30 минут
learn-freq_random = Случайно (5-60 мин)
learn-started = 🚀 Изучение запущено! Жди первое слово...
learn-stopped = ⏸ Изучение остановлено.
learn-no_words = Сначала добавь слова через /add
learn-already_active = У тебя уже есть активная сессия. Сначала останови её через /stop
learn-no_active_session = У тебя нет активной сессии. Нажми /learn

flashcard-show_translation = Показать перевод 👀
flashcard-know = Знаю ✅
flashcard-hard = Сложно 🔄
flashcard-delete_word = Удалить 🗑
flashcard-word_prompt = 📝 «{ $word }»
flashcard-word_with_translation =
    📝 «{ $word }»
    💡 { $translation }
flashcard-all_learned = 🎉 Все слова выучены! Добавь новые через /add

settings-title = ⚙️ Настройки
settings-interface_lang = Язык интерфейса: { $lang }
settings-target_lang = Язык изучения: { $lang }
settings-timezone = Часовой пояс: { $tz }
settings-change_interface = Изменить язык интерфейса
settings-change_target = Изменить язык изучения
settings-lang_updated = ✅ Язык обновлён!
settings-target_updated = ✅ Язык изучения обновлён!

stats-title = 📊 Твоя статистика
stats-total_words = Всего слов: { $count }
stats-learned = Выучено: { $count }
stats-in_progress = В процессе: { $count }
stats-active_session = Активная сессия: { $method } ({ $frequency })
stats-no_session = Нет активной сессии

help-title = 📖 Доступные команды:
help-start = /start — Начать работу с ботом
help-add = /add — Добавить новое слово
help-words = /words — Просмотреть словарь
help-learn = /learn — Начать изучение
help-stop = /stop — Остановить изучение
help-settings = /settings — Настройки
help-stats = /stats — Статистика
help-import = /import — Импортировать слова из файла
help-export = /export — Экспортировать словарь
help-help = /help — Эта справка

errors-generic = 😔 Что-то пошло не так. Попробуй ещё раз.
errors-no_active_session = У тебя нет активной сессии. Нажми /learn

languages-uk = 🇺🇦 Українська
languages-en = 🇬🇧 English
languages-ru = Русский
