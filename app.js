import { Telegraf, Markup, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { SQLite } from "@telegraf/session/sqlite";
import { welcomeMessage, helpMessage } from './config.js' 
import 'dotenv/config'
import { getDaySchedule, getGroup } from './requests.js';
    
if (process.env.BOT_TOKEN === undefined) {
	throw new TypeError("BOT_TOKEN must be provided!");
}

// Bot configuration
const bot = new Telegraf(process.env.BOT_TOKEN)
const store = SQLite({
	filename: "./sessions.sqlite",
});
// bot.use(Telegraf.log()) // Debug
bot.use(session({store}));


bot.use(async (ctx, next) => {
	// set a default value
	ctx.session ??= { group: "" };
	console.log(ctx.session.group)

    await next()
});

bot.command('quit', async (ctx) => {
  await ctx.leaveChat()
})

bot.command('start', async (ctx) => {
    await ctx.reply(
        welcomeMessage,
        Markup.keyboard([
			"Расписание на сегодня",
			"Расписание на завтра"
		]).resize()
    )
})

bot.command('help', async (ctx) => {
    await ctx.reply(
        helpMessage,
        Markup.keyboard([
			"Расписание на сегодня",
			"Расписание на завтра"
		]).resize()
    )
})

bot.hears(/\/set_group (.+)/, async (ctx) => {
    const group = ctx.match[1]
    const suggested_groups = await getGroup(group)

    if (suggested_groups.length > 1) {
        await ctx.reply(
            `Возможно вы имели ввиду: ${suggested_groups.slice(0, 3).join(", ")}?\nПожалуйста, введите больше букв.`,
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    } else if (suggested_groups.length == 0) {
        await ctx.reply(
            `Групп с таким названием не существует.`,
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    } else {
        ctx.session.group = suggested_groups[0]
        await ctx.reply(
            `Выбрана группа: ${suggested_groups[0]}`,
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    }
})


// Button
bot.hears("Расписание на сегодня", async (ctx) => {
    const date = new Date()

    if (ctx.session.group == "") {
        return await ctx.reply(
            "Выбирете группу!\n /set_group имя_группы",
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    } else {                
        return await ctx.reply(
            await getDaySchedule(date, ctx.session.group),
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    }
})

bot.hears("Расписание на завтра", async (ctx) => {
    const date = new Date(Date.now() + (60*60*24*1000))

    if (ctx.session.group == "") {
        return await ctx.reply(
            "Выбирете группу!\n /set_group имя_группы",
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    } else {                
        return await ctx.reply(
            await getDaySchedule(date, ctx.session.group),
            Markup.keyboard([
                "Расписание на сегодня",
                "Расписание на завтра"
            ]).resize()
        )
    }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))