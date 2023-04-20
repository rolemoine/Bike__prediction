import gunzip from "gunzip-file";
import puppeteer, { Page } from "puppeteer";
import { rmSync, writeFileSync } from "fs";
import Utils from "../utils/utils";
import Parser from "../utils/parser";

const goto = async (page: Page, link: string) =>
  page.evaluate((link) => {
    location.href = link;
  }, link);

// prettier-ignore
const months = ["01","02","03","04","05","06","07","08","09","10","11","12"]  as const;
const years = ["21", "22", "23"] as const;
const orlyStationNumber = "07149" as const;

class Weather {
  private static downloadByDate = async (filename: string) => {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: Utils.getDownloadPath(),
    });
    await goto(
      page,
      `https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Synop/Archive/${filename}`
    );
    await Utils.delay(1000);
    await page.close();
    await browser.close();
  };

  private static unzipAndDelete = (filename: string) => {
    gunzip(
      `${Utils.getDownloadPath()}/${filename}`,
      `${Utils.getDownloadPath()}/${filename
        .replace(".gz", "")
        .replace("synop.20", "")}`,
      () => {
        rmSync(`${Utils.getDownloadPath()}/${filename}`);
      }
    );
  };

  private static download = async () => {
    for (const year of years) {
      for (const month of months) {
        const filename = `synop.20${year}${month}.csv.gz`;
        await Weather.downloadByDate(filename);
        Weather.unzipAndDelete(filename);
      }
    }
  };

  private static parse = () => {
    let data: Record<string, string>[] = [];
    for (const year of years) {
      for (const month of months) {
        try {
          const filename = `${Utils.getDownloadPath()}/${year}${month}.csv`;
          data = Utils.merge(
            data,
            Parser.csv(
              filename,
              ["t", "date", "u", "rr1", "rr3", "ff", "n"],
              [{ attribute: "numer_sta", value: orlyStationNumber }]
            )
          );
          rmSync(filename);
        } catch (e) {}
      }
    }
    writeFileSync(
      `${Utils.getDownloadPath()}/weather.json`,
      Utils.stringify(data)
    );
    return data;
  };

  public static getDataset = async () => {
    console.log("__WEATHER__");
    await Weather.download();
    return Weather.parse();
  };
}
export default Weather;
