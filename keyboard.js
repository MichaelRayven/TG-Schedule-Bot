import { Markup } from 'telegraf'

export const defaultKeyboard = Markup.keyboard([
    "Расписание на сегодня",
	"Расписание на завтра",
    "Заметки"
])

export const notesKeyboard = Markup.inlineKeyboard([
    Markup.button.callback("Посмотреть заметки", "show_notes"),
    Markup.button.callback("Добавить заметку", "add_note"),
    Markup.button.callback("Удалить заметку", "delete_note"),
])

