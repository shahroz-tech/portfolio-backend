import { UAParser } from "ua-parser-js";

export interface ParsedUA {
  browser: string;
  os: string;
  device: string;
}

export const parseUserAgent = (uaString?: string): ParsedUA => {
  const parser = new UAParser(uaString || "");
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    browser: browser.name ? `${browser.name} ${browser.version || ""}`.trim() : "unknown",
    os: os.name ? `${os.name} ${os.version || ""}`.trim() : "unknown",
    device: device.type || "desktop",
  };
};
