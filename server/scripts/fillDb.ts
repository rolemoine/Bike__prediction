import Database from "../src/database";
import Weather from "./getWeather";
import Bike from "./getBike";
import Calendar from "./getCalendar";

const fillDb = async () => {
  const database = await Database.create();

  const bikeData = await Bike.getDataset();
  database.insertMany("bike", bikeData.map(Object.values));

  const weatherData = await Weather.getDataset();
  database.insertMany("weather", weatherData.map(Object.values));

  const calendarData = await Calendar.getDataset();
  database.insertMany("calendar", calendarData.map(Object.values));

  database.end();
};

fillDb();
