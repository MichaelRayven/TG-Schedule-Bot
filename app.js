import { Telegraf, Markup, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { SQLite } from "@telegraf/session/sqlite";
import { welcomeMessage, helpMessage } from './config.js'
import { getDaySchedule, getGroup } from './requests.js';
import { defaultKeyboard } from './keyboard.js';
import 'dotenv/config'

if (process.env.BOT_TOKEN === undefined) {
    throw new TypeError("BOT_TOKEN must be provided!");
}

// Bot configuration
const bot = new Telegraf(process.env.BOT_TOKEN)
const store = SQLite({
    filename: "./sessions.sqlite",
});
// bot.use(Telegraf.log()) // Debug
bot.use(session({ store }));


bot.use(async (ctx, next) => {
    // set a default value
    ctx.session ??= {
        group: "",
        notes: []
    };

    await next()
});

bot.command('quit', async (ctx) => {
    await ctx.leaveChat()
})

bot.command('start', async (ctx) => {
    await ctx.reply(
        welcomeMessage,
        defaultKeyboard
    )
})

bot.command('help', async (ctx) => {
    await ctx.reply(
        helpMessage,
        defaultKeyboard
    )
})

bot.hears(/\/set_group (.+)/, async (ctx) => {
    const group = ctx.match[1]
    const suggested_groups = await getGroup(group)

    if (suggested_groups.length > 1) {
        return await ctx.reply(
            `Возможно вы имели ввиду: ${suggested_groups.slice(0, 3).join(", ")}?\nПожалуйста, введите больше букв.`,
            defaultKeyboard
        )
    } else if (suggested_groups.length == 0) {
        return await ctx.reply(
            `Групп с таким названием не существует.`,
            defaultKeyboard
        )
    } else {
        ctx.session.group = suggested_groups[0]
        return await ctx.reply(
            `Выбрана группа: ${suggested_groups[0]}`,
            defaultKeyboard
        )
    }
})

bot.hears(/\/add_note (.+)/, async (ctx) => {
    const note = ctx.match[1]

    if (note == "") {
        return await ctx.reply(
            "Введите заметку в формате /add_note имя_заметки",
            defaultKeyboard
        )
    } else {
        const number = ctx.session.notes.push([note, false])
        return await ctx.reply(
            `Заметка добавлена, под номером ${number}!\nИспользуйте /check_off номер_заметки, чтобы отметить заметку как выполненную.`,
            defaultKeyboard
        )
    }
})

bot.hears(/\/check_off (\d+)/, async (ctx) => {
    const number = ctx.match[1]

    if (ctx.session.notes.length >= number) {
        const [note, status] = ctx.session.notes[number - 1]
        ctx.session.notes[number - 1] = [note, !status]

        return await ctx.reply(
            `Заметка, под номером ${number} отмечена как выполненная!\nИспользуйте /delete_note номер_заметки, чтобы удалить заметку.`,
            defaultKeyboard
        )

    } else {
        return await ctx.reply(
            "Введите заметку в формате /check_off номер_заметки",
            defaultKeyboard
        )
    }
})

bot.hears(/\/delete_note (\d+)/, async (ctx) => {
    const number = ctx.match[1]

    if (ctx.session.notes.length >= number) {
        ctx.session.notes.splice(number - 1, 1)

        return await ctx.reply(
            `Заметка удалена.`,
            defaultKeyboard
        )
    } else {
        return await ctx.reply(
            "Введите заметку в формате /delete_note номер_заметки",
            defaultKeyboard
        )
    }
})


// Button
bot.hears("Расписание на сегодня", async (ctx) => {
    const date = new Date()

    if (ctx.session.group == "") {
        return await ctx.reply(
            "Выбирете группу!\n /set_group имя_группы",
            defaultKeyboard
        )
    } else {
        return await ctx.reply(
            await getDaySchedule(date, ctx.session.group),
            defaultKeyboard
        )
    }
})

bot.hears("Расписание на завтра", async (ctx) => {
    const date = new Date(Date.now() + (60 * 60 * 24 * 1000))

    if (ctx.session.group == "") {
        return await ctx.reply(
            "Выбирете группу!\n /set_group имя_группы",
            defaultKeyboard
        )
    } else {
        return await ctx.reply(
            await getDaySchedule(date, ctx.session.group),
            defaultKeyboard
        )
    }
})

bot.hears("Посмотреть заметки", async (ctx) => {
    if (ctx.session.notes.length > 0) {
        return await ctx.reply(
            ctx.session.notes.map((entry, ind) => {
                return `${entry[1] ? "✅" : "❎"} ${ind + 1}. ${entry[0]}`
            }).join("\n"),
            defaultKeyboard
        )
    } else {
        return await ctx.reply(
            `Ваш список заметок пуст, используйте /add_note заметка, чтобы добавить новую заметку!`,
            defaultKeyboard
        )
    }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))