start-welcome = 👋 Hello, { $name }! I'll help you learn new words.
start-choose_language = Choose your interface language:
start-choose_target = Which language are you learning?
start-setup_complete = ✅ Setup complete! Add your first word with /add

words-add_prompt = Type the word in the foreign language:
words-add_translation = Now type the translation:
words-add_context = Add an example sentence (or press /skip):
words-added = ✅ Word «{ $word }» added!
words-empty = You don't have any words yet. Add your first one with /add
words-list_header = 📚 Your dictionary ({ $count } words):
words-deleted = 🗑 Word deleted
words-not_found = Word not found.
words-import_prompt = Send a text file. Format: one word per line, word and translation separated by a dash or tab.
words-import_success = ✅ Imported { $count } words!
words-import_error = Could not parse the file. Please check the format.
words-import_empty = The file is empty or contains no valid lines.
words-export_empty = You have no words to export.
words-export_header = 📤 Your dictionary
words-too_long = Word or translation is too long. Maximum: 200 / 500 characters.

learn-choose_method = Choose a learning method:
learn-flashcard_name = 📬 Push Flashcards
learn-flashcard_desc = Receive word notifications at set intervals
learn-choose_frequency = How often should I send words?
learn-freq_1min = Every minute (test)
learn-freq_5min = Every 5 minutes
learn-freq_30min = Every 30 minutes
learn-freq_random = Random (5-60 min)
learn-started = 🚀 Learning started! Expect your first word soon...
learn-stopped = ⏸ Learning stopped.
learn-no_words = Add words first with /add
learn-already_active = You already have an active session. Stop it first with /stop
learn-no_active_session = You don't have an active session. Press /learn

flashcard-show_translation = Show translation 👀
flashcard-know = Know ✅
flashcard-hard = Hard 🔄
flashcard-delete_word = Delete 🗑
flashcard-word_prompt = 📝 «{ $word }»
flashcard-word_with_translation =
    📝 «{ $word }»
    💡 { $translation }
flashcard-all_learned = 🎉 All words learned! Add more with /add

settings-title = ⚙️ Settings
settings-interface_lang = Interface language: { $lang }
settings-target_lang = Learning language: { $lang }
settings-timezone = Timezone: { $tz }
settings-change_interface = Change interface language
settings-change_target = Change learning language
settings-lang_updated = ✅ Language updated!
settings-target_updated = ✅ Learning language updated!

stats-title = 📊 Your statistics
stats-total_words = Total words: { $count }
stats-learned = Learned: { $count }
stats-in_progress = In progress: { $count }
stats-active_session = Active session: { $method } ({ $frequency })
stats-no_session = No active session

help-title = 📖 Available commands:
help-start = /start — Start the bot
help-add = /add — Add a new word
help-words = /words — View your dictionary
help-learn = /learn — Start learning
help-stop = /stop — Stop learning
help-settings = /settings — Settings
help-stats = /stats — Statistics
help-import = /import — Import words from file
help-export = /export — Export your dictionary
help-help = /help — This help

errors-generic = 😔 Something went wrong. Please try again.
errors-no_active_session = You don't have an active session. Press /learn

languages-uk = 🇺🇦 Українська
languages-en = 🇬🇧 English
