import axios from "axios";
import { writeFileSync } from "fs";
import Utils from "../utils/utils";

interface VacationRecord {
  datasetid: string;
  recordid: string;
  fields: {
    end_date: string;
    start_date: string;
    location: string;
    annee_scolaire: string;
    description: string;
    zones: string;
    population: string;
  };
  record_timestamp: string;
}

interface CalendarRecord {
  isVacation: boolean;
  isWeekend: boolean;
  date: Date;
  dayIndex: number;
  dayName: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const years = [2021, 2022, 2023] as const;

class Calendar {
  private static getVacationByDate = async (
    year: number
  ): Promise<VacationRecord[]> => {
    return (
      await axios.get(
        `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&lang=FR&facet=description&facet=population&facet=start_date&facet=end_date&facet=location&facet=zones&facet=annee_scolaire&refine.location=Paris&refine.zones=Zone+C&refine.start_date=${year}&refine.end_date=${year}`
      )
    ).data.records;
  };

  private static isBetweenOrEqual = (start: Date, value: Date, end: Date) =>
    value.valueOf() >= start.valueOf() && value.valueOf() <= end.valueOf();

  private static getDaysInMonth = (month: number, year: number) =>
    new Array(31)
      .fill("")
      .map((_v, i) => new Date(year, month - 1, i + 1))
      .filter((v) => v.getMonth() === month - 1);

  private static isVacationDay = (day: Date, vacations: VacationRecord[]) =>
    vacations.some((vacation) => {
      const start = new Date(vacation.fields.start_date);
      const end = new Date(vacation.fields.end_date);
      return Calendar.isBetweenOrEqual(start, day, end);
    });

  private static parseMonth = (
    month: number,
    year: number,
    vacations: VacationRecord[]
  ) =>
    Calendar.getDaysInMonth(month, year).map((day) => ({
      date: day,
      isVacation: Calendar.isVacationDay(day, vacations),
      isWeekend: day.getDay() === 6 || day.getDay() === 0,
      dayName: DAY_NAMES[day.getDay()],
      dayIndex: day.getDay() % 7,
    }));

  private static parseYear = (year: number, vacations: VacationRecord[]) => {
    let calendar: CalendarRecord[] = [];
    for (let month = 1; month < 13; month++) {
      calendar = Utils.merge(
        calendar,
        Calendar.parseMonth(month, year, vacations)
      );
    }
    return calendar;
  };

  private static getAndParse = async () => {
    let calendar: CalendarRecord[] = [];
    for (const year of years) {
      const vacations = await Calendar.getVacationByDate(year);
      calendar = Utils.merge(calendar, Calendar.parseYear(year, vacations));
    }
    writeFileSync(
      `${Utils.getDownloadPath()}/calendar.json`,
      Utils.stringify(calendar)
    );
    return calendar;
  };

  public static getDataset = () => {
    console.log("__CALENDAR__");
    return Calendar.getAndParse();
  };
}

export default Calendar;
