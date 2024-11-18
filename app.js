import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import 'dotenv/config'

import { welcomeMessage, helpMessage, scheduleMonday, 
    scheduleTuesday, scheduleWednesday, scheduleThursday, 
    scheduleFriday, scheduleSaturday, scheduleSunday } from 'config.js' 

const schedules = [scheduleSunday, scheduleMonday, scheduleTuesday, scheduleWednesday, scheduleThursday, scheduleFriday, scheduleSaturday];


const bot = new Telegraf(process.env.BOT_TOKEN)



bot.command('quit', async (ctx) => {
  await ctx.leaveChat()
})

bot.command('start', async (ctx) => {
    await ctx.reply(
        welcomeMessage,
        Markup.keyboard([
			Markup.button.callback("Расписание на сегодня", "schedule_today"),
			Markup.button.callback("Расписание на завтра", "schedule_tomorrow"),
		]).resize()
    )
})

bot.command('help', async (ctx) => {
    await ctx.reply(
        helpMessage,
        Markup.keyboard([
			Markup.button.callback("Расписание на сегодня", "schedule_today"),
			Markup.button.callback("Расписание на завтра", "schedule_tomorrow"),
		]).resize()
    )
})

bot.action("schedule_today", async (ctx) => {
    const date = new Date();
    const schedule = schedules[date.getDay()];

    await ctx.reply(
        schedule,
        Markup.keyboard([
			Markup.button.callback("Расписание на сегодня", "schedule_today"),
			Markup.button.callback("Расписание на завтра", "schedule_tomorrow"),
		]).resize()
    )
})

bot.action("schedule_tomorrow", async (ctx) => {
    const date = new Date();
    const schedule = schedules[date.getDay() + 1];

    await ctx.reply(
        schedule,
        Markup.keyboard([
			Markup.button.callback("Расписание на сегодня", "schedule_today"),
			Markup.button.callback("Расписание на завтра", "schedule_tomorrow"),
		]).resize()
    )
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
