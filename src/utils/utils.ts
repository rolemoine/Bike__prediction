class Utils {
  public static merge = <T>(arr1: T[], arr2: T[]): T[] => [...arr1, ...arr2];

  public static delay = async (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  public static getDownloadPath = () => "./download";

  public static stringify = (value: unknown) => JSON.stringify(value, null, 2);
}

export default Utils;
