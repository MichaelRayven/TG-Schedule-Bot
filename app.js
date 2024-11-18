import { Telegraf, Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import 'dotenv/config'

import { welcomeMessage, helpMessage, scheduleMonday, 
    scheduleTuesday, scheduleWednesday, scheduleThursday, 
    scheduleFriday, scheduleSaturday, scheduleSunday } from './config.js' 

const schedules = [scheduleSunday, scheduleMonday, scheduleTuesday, scheduleWednesday, scheduleThursday, scheduleFriday, scheduleSaturday];


const bot = new Telegraf(process.env.BOT_TOKEN)
// bot.use(Telegraf.log()) // Debug

bot.command("caption", ctx => {
	return ctx.replyWithPhoto(
		{ url: "https://picsum.photos/200/300/?random" },
		{
			caption: "Caption",
			parse_mode: "Markdown",
			...Markup.inlineKeyboard([
				Markup.button.callback("Plain", "plain"),
				Markup.button.callback("Italic", "italic"),
			]),
		},
	);
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

bot.hears("Расписание на сегодня", async (ctx) => {
    const date = new Date()
    const schedule = schedules[date.getDay()]

    await ctx.reply(
        schedule,
        Markup.keyboard([
			"Расписание на сегодня",
			"Расписание на завтра"
		]).resize()
    )
})

bot.hears("Расписание на завтра", async (ctx) => {
    const date = new Date()
    const schedule = schedules[date.getDay() + 1]

    await ctx.reply(
        schedule,
        Markup.keyboard([
			"Расписание на сегодня",
			"Расписание на завтра"
		]).resize()
    )
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))