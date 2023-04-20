import XLSX from "xlsx";
import fs from "fs";

interface ParserFilter {
  attribute: string;
  value: string;
}

interface ParserAttribute {
  src: string;
  dest?: string;
}

class Parser {
  private static pickAttributes = (
    list: Record<string, string>[],
    attributes: ParserAttribute[]
  ) => {
    return list.map((el) => {
      const obj: Record<string, string> = {};
      attributes.forEach((attribute) => {
        obj[attribute.dest || attribute.src] = el[attribute.src];
      });
      return obj;
    });
  };

  public static json = (filename: string, attributes: ParserAttribute[]) => {
    const file = fs.readFileSync(filename, "utf8");
    const content: Record<string, string>[] = JSON.parse(file);
    return Parser.pickAttributes(content, attributes);
  };

  public static xsls = (filename: string, attributes: ParserAttribute[]) => {
    const file = XLSX.readFile(filename);
    const sheet_name_list = file.SheetNames;
    const data: Record<string, string>[] = [];
    sheet_name_list.forEach(function (y) {
      const worksheet = file.Sheets[y];
      const headers: Record<string, string> = {};
      for (const z in worksheet) {
        if (z[0] === "!") continue;
        var col = z.substring(0, 1);
        var row = parseInt(z.substring(1));
        var value = worksheet[z].v;

        if (row == 1) {
          headers[col] = value;
          continue;
        }

        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
      }
      data.shift();
      data.shift();
    });
    return Parser.pickAttributes(data, attributes);
  };

  public static csv = (
    filename: string,
    attributes: string[],
    filters: ParserFilter[]
  ) => {
    const file = fs.readFileSync(filename, "utf8");
    const lines: string[] = file.split("\n");
    const headers = lines[0].split(";");
    const content = lines
      .slice(1)
      .filter((line) => {
        const values = line.split(";");
        return filters.every((filter) => {
          return (
            values[headers.findIndex((e) => e === filter.attribute)] ===
            filter.value
          );
        });
      })
      .map((line) => {
        const values = line.split(";");
        const obj: Record<string, string> = {};
        attributes.forEach((attribute) => {
          obj[attribute] = values[
            headers.findIndex((e) => e === attribute)
          ] as string;
        });
        return obj;
      });
    return content;
  };
}

export default Parser;
