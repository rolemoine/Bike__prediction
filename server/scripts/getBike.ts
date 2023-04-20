import puppeteer, { Page } from "puppeteer";
import { renameSync, rmSync, writeFileSync } from "fs";
import Utils from "../utils/utils";
import { extname } from "path";
import Parser from "../utils/parser";

const formatMatcher = {
  csv: 1,
  json: 3,
  xlsx: 5,
} as const;

const goto = async (page: Page, link: string) =>
  page.evaluate((link) => {
    location.href = link;
  }, link);

class Bike {
  private static downloadByStation = async (
    station: string,
    options: {
      filename: string;
      format: keyof typeof formatMatcher;
    }
  ) => {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const { format, filename } = options;
    const downloadFileName = `comptage-velo-donnees-compteurs.${format}`;
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: Utils.getDownloadPath(),
    });
    await goto(
      page,
      `https://parisdata.opendatasoft.com/explore/dataset/comptage-velo-donnees-compteurs/export/?disjunctive.id_compteur&disjunctive.nom_compteur&disjunctive.id&disjunctive.name&timezone=Europe%2FBerlin&rows=&lang=FR&refine.name=${encodeURIComponent(
        station
      )}`
    );
    await page.waitForSelector(".ods-dataset-export-link__link");
    await page.evaluate(
      (body, format, formatMatcher) => {
        if (!body) return;
        const elements =
          body.querySelectorAll(".ods-dataset-export-link__link") || [];
        const element = elements[formatMatcher[format]] as HTMLElement;
        element.click();
      },
      await page.$("body"),
      format,
      formatMatcher
    );
    await Utils.delay(1 * 60 * 1000); // y * x seconds
    await page.close();
    await browser.close();
    renameSync(
      `${Utils.getDownloadPath()}/${downloadFileName}`,
      `${Utils.getDownloadPath()}/${filename}.${format}`
    );
  };

  private static download = async () => {
    await Bike.downloadByStation("Totem 73 boulevard de Sébastopol", {
      filename: "velo-rivoli",
      format: "json",
    });
    await Bike.downloadByStation("Totem 64 Rue de Rivoli", {
      filename: "velo-sebastopol",
      format: "xlsx",
    });
  };

  private static parseByExtension = (filename: string) => {
    let data: Record<string, string>[] = [];
    if (extname(filename) === ".json") {
      data = Parser.json(filename, [
        { src: "id_compteur" },
        { src: "id" },
        { src: "name" },
        { src: "sum_counts" },
        { src: "date" },
        { src: "installation_date" },
        { src: "counter" },
        { src: "mois_annee_comptage" },
      ]);
    }
    if (extname(filename) === ".xlxs") {
      data = Parser.xsls(filename, [
        { src: "Identifiant du compteur", dest: "id_compteur" },
        { src: "Identifiant du site de comptage", dest: "id" },
        { src: "Nom du site de comptage", dest: "name" },
        { src: "Comptage horaire", dest: "sum_counts" },
        { src: "Date et heure de comptage", dest: "date" },
        {
          src: "Date d'installation du site de comptage",
          dest: "installation_date",
        },
        { src: "Identifiant technique compteur", dest: "counter" },
        { src: "mois_annee_comptage", dest: "mois_annee_comptage" },
      ]);
    }
    rmSync(filename);
    return data;
  };

  private static parse = () => {
    const bikeRivoli = Bike.parseByExtension(
      `${Utils.getDownloadPath()}/velo-rivoli.json`
    );
    const bikeSebastopol = Bike.parseByExtension(
      `${Utils.getDownloadPath()}/velo-sebastopol.xlsx`
    );
    const data = Utils.merge(bikeRivoli, bikeSebastopol);
    writeFileSync(
      `${Utils.getDownloadPath()}/velo.json`,
      Utils.stringify(data)
    );
    return data;
  };

  public static getDataset = async () => {
    console.log("__BIKE__");
    await Bike.download();
    return Bike.parse();
  };
}

export default Bike;
