export const site = {
  name: "Mellon Real Estate",
  url: "https://mellonhomes.com",
  broker: "Ian Mellon",
  email: "ianmellon@yahoo.com",
  phone: "(661) 805-2481",
  phoneHref: "tel:+16618052481",
  license: "01921587",
};

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString();
