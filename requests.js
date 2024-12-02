import { BASE_URL, SEARCH_ROUTE, SCHEDULE_ROUTE } from "./config.js";
import { getWeekDayName } from './utils.js';
import { parse } from "node-html-parser";

export const getGroup = async (group) => {
    const query_url = BASE_URL + SEARCH_ROUTE + group;

    const res = await fetch(query_url);
    const data = (await res.json()).items;

    // Parsing
    const root = parse(`<div>${data}</div>`);

    const suggested_groups = [];
    root
        .querySelectorAll("a")
        .forEach((link) => suggested_groups.push(link.textContent));

    return suggested_groups;
};

export const getDaySchedule = async (date, group) => {
    const day_of_week = (date.getDay() + 6) % 7;

    if (day_of_week == 6) {
        return "Выходной";
    }

    let query_url = BASE_URL + SCHEDULE_ROUTE + group;
    let res = await fetch(query_url);
    let data = await res.text();

    // Handling future dates
    let root = parse(data);
    const current_week = parseInt(root.querySelector('.schedule__title-label').innerText.split(" ")[0])
    const [last_day, last_month] = root.querySelectorAll(
        ".schedule__table>.schedule__table-body>.schedule__table-row"
    )[5].querySelector(".schedule__table-date").textContent.split(".");
    const week_last_date = new Date(`${date.getFullYear()}-${last_month}-${last_day}`)

    if (week_last_date.getTime() < date.getTime()) {
        const time_diff = date.getTime() - week_last_date.getTime()
        const week_diff = time_diff / (7 * 24 * 60 * 60 * 1000)

        query_url += `&week=${current_week + week_diff}`
        res = await fetch(query_url);
        data = await res.text();
        root = parse(data);
    }
    
    // Parsing schedule
    const day = root.querySelectorAll(
        ".schedule__table>.schedule__table-body>.schedule__table-row"
    )[day_of_week];

    const [head, body] = day.querySelectorAll(">.schedule__table-cell");

    const schedule_data = {
        date: date.toISOString().split("T")[0],
        head: "",
        schedule: [],
    };

    schedule_data.head = head.textContent.replace(/\s+/, "\n").trim();

    body.querySelectorAll(">.schedule__table-row").forEach((entry) => {
        const [time, table_data] = entry.querySelectorAll(">.schedule__table-cell");
        const text = table_data.textContent.trim().replace(/[\t\n]+/g, " ");
        schedule_data.schedule.push([time.textContent.trim(), text]);
    });

    console.log(schedule_data.schedule);
    

    if (schedule_data.schedule.filter(arr => arr[1] != "").length == 0) {
        return `Расписание на ${getWeekDayName(day_of_week)} (${schedule_data.date})
===============================
Пар в расписании нет.`
    } else {
        return `Расписание на ${getWeekDayName(day_of_week)} (${schedule_data.date})
===============================
${schedule_data.schedule.reduce(
            (acc, item) => {
                return acc + `${item[0]} | ${item[1]}\n`
            }, ""
        )}`
    }
};
