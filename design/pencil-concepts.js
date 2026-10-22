const conceptData = [
  {
    key: "bright",
    name: "01 Bright Beginnings",
    idea: "The closest continuation of the current mascot hero. Warm, memorable, and equally welcoming to buyers and sellers.",
    headline: "A BRIGHTER\nMOVE.",
    lead: "Buy, sell, or navigate a complex property situation with local guidance from Ian Mellon.",
    background: "#FFF8F1",
    ink: "#40142B",
    pink: "#E997B7",
    pale: "#F7DBE7",
    heading: "Archivo Black",
    radius: 28
  },
  {
    key: "clear",
    name: "02 A Clear Way Forward",
    idea: "A calmer advisory direction. Ian's specialist experience leads the message, with a restrained mascot and an editorial listing presentation.",
    headline: "Clear guidance.\nA brighter move.",
    lead: "Specialist real estate support for pre-foreclosure, delinquency, probate, divorce, and short sales.",
    background: "#FBFBF7",
    ink: "#123F33",
    pink: "#EAB6C8",
    pale: "#F7E9ED",
    heading: "Manrope",
    radius: 12
  },
  {
    key: "local",
    name: "03 Local Opportunity",
    idea: "A property-led brokerage direction. Oversized photography and the development pipeline take priority, while specialist seller support stays easy to find.",
    headline: "LOCAL HOMES.\nBRIGHT FUTURES.",
    lead: "Mellon listings, new developments, and clear real estate guidance in Bakersfield and Shafter.",
    background: "#FFF9F4",
    ink: "#123B2D",
    pink: "#EF92B2",
    pale: "#FCE0E9",
    heading: "Archivo Black",
    radius: 4
  }
];
const specialties = [
  ["Pre-foreclosure & delinquency", "Understand your property's position and discuss a practical next step.", "house-line"],
  ["Probate", "Clear communication for families navigating an inherited property.", "key"],
  ["Divorce", "A neutral, professional approach, with discretion and clear communication.", "handshake"],
  ["Short sales", "Talk through a possible sale and the questions to raise with your lender.", "file-text"]
];
const projects = [
  ["Under construction", [["1806 Williams Street", "Fourplex"], ["2209 Palm Street", "Fourplex"], ["Rodriguez Street, Shafter", "Duplex"]]],
  ["Ready to build", [["1307 Grace Street", "Triplex"], ["Martinez Street, Shafter", "Duplex"]]],
  ["In plan check", [["215 Clifton Street", "Duplex"], ["1311 Eureka Street", "Triplex"], ["1231 Quincy Street", "Duplex"]]]
];
const assetPaths = {
  mascot: "./public/images/mellon-mascot.png",
  showcase: "./reference/Modern Identical Build Real Estate Showcase.png"
};

function frame(parent, name, properties = {}) {
  return Insert(parent, { type: "frame", name, layout: "vertical", width: "fill_container", height: "fit_content", ...properties });
}
function text(parent, name, content, size, color, properties = {}) {
  const node = { type: "text", name, content, fontFamily: "Nunito Sans", fontSize: size, lineHeight: 1.4, fill: color, textGrowth: "fixed-width", width: "fill_container", ...properties };
  if (node.textGrowth === "auto") {
    delete node.width;
    delete node.height;
  }
  return Insert(parent, node);
}
function heading(parent, content, size, design, properties = {}) {
  return text(parent, "Heading: " + content.replaceAll("\n", " "), content, size, design.ink, { fontFamily: design.heading, fontWeight: "800", lineHeight: 1.08, letterSpacing: -1.8, ...properties });
}
function icon(parent, name, color, size = 24) {
  return Insert(parent, { type: "icon", name, library: "phosphor", icon: name, width: size, height: size, fill: color });
}
function button(parent, label, design, secondary = false, properties = {}) {
  const node = frame(parent, label, { layout: "horizontal", width: "fit_content", height: 54, padding: [0, 23], gap: 20, alignItems: "center", justifyContent: "center", fill: secondary ? design.background : design.ink, cornerRadius: design.key === "local" ? 4 : 40, stroke: design.ink, strokeWidth: 1, ...properties });
  text(node, "Button label", label, 15, secondary ? design.ink : "#FFF9EF", { textGrowth: "auto", fontWeight: "800" });
  icon(node, "arrow-up-right", secondary ? design.ink : "#FFF9EF", 19);
  return node;
}
function photo(parent, name, width, height, variant = "exterior", properties = {}) {
  const transform = variant === "exterior"
    ? [1, 0, 0, 3.367, 0, -.596]
    : variant === "living" ? [1.633, 0, 0, 4.98, 0, -2.543]
    : [2.58, 0, 0, 4.98, -1.58, -2.543];
  return Insert(parent, { type: "rectangle", name, width, height, fill: { type: "image", url: assetPaths.showcase, mode: "cover", transform }, ...properties });
}
function mascot(parent, width, height, properties = {}) {
  return Insert(parent, { type: "rectangle", name: "Original Mellon mascot", width, height, fill: { type: "image", url: assetPaths.mascot, mode: "contain" }, ...properties });
}
function section(parent, name, design, properties = {}) {
  return frame(parent, name, { padding: [88, 80], gap: 34, fill: design.background, ...properties });
}
function header(parent, design) {
  const node = frame(parent, "Navigation", { layout: "horizontal", height: 88, padding: [16, 64], gap: 40, alignItems: "center", justifyContent: "space_between", fill: design.key === "bright" ? "#E997B7" : design.background });
  const brand = frame(node, "Mellon wordmark", { width: 190, gap: 0 });
  text(brand, "Mellon", "mellon", 36, design.ink, { fontFamily: "Archivo Black", lineHeight: 1 });
  text(brand, "Real Estate", "REAL ESTATE", 10, design.ink, { fontWeight: "800", letterSpacing: 3 });
  const nav = frame(node, "Navigation links", { width: "fit_content", layout: "horizontal", gap: 28, alignItems: "center" });
  for (const item of ["Mellon listings", "Seller support", "Development", "About Ian"]) text(nav, item, item, 14, design.ink, { textGrowth: "auto", fontWeight: "750" });
  button(node, "Talk with Ian", design, false, { height: 48 });
  return node;
}
function hero(parent, design) {
  const node = frame(parent, "Hero | " + design.name, { layout: "none", height: 750, clip: true, fill: design.pink });
  if (design.key === "bright") {
    Update(node, { fill: { type: "gradient", gradientType: "linear", rotation: 90, colors: [{ color: "#EDABCA", position: 0 }, { color: "#CC5487", position: 1 }] } });
    mascot(node, 860, 750, { x: 560, y: 0 });
    const copy = frame(node, "Hero copy", { x: 72, y: 100, width: 690, gap: 26 });
    text(copy, "Local brokerage", "BAKERSFIELD & SHAFTER REAL ESTATE", 12, "#40142B", { fontWeight: "900", letterSpacing: 1.4 });
    heading(copy, design.headline, 96, design, { fill: "#FFF9E9", lineHeight: .98 });
    text(copy, "Hero description", design.lead, 21, design.ink, { width: 410 });
    const actions = frame(copy, "Hero actions", { layout: "horizontal", gap: 12 });
    button(actions, "Talk about your options", design);
    button(actions, "Mellon listings", design, true);
    const note = frame(node, "Specialist support callout", { x: 1040, y: 560, width: 310, padding: 23, gap: 10, fill: "#FFF9EFF2", cornerRadius: 24 });
    text(note, "Specialist callout title", "A complicated move?\nStart with a conversation.", 21, design.ink, { fontWeight: "900", lineHeight: 1.2 });
    text(note, "Specialist callout link", "Explore seller support  ↗", 14, design.ink, { fontWeight: "800" });
  } else if (design.key === "clear") {
    mascot(node, 735, 685, { x: 695, y: 65 });
    const copy = frame(node, "Hero copy", { x: 80, y: 78, width: 650, gap: 26 });
    text(copy, "Broker introduction", "IAN MELLON / CALIFORNIA REAL ESTATE BROKER", 12, design.ink, { fontWeight: "800", letterSpacing: 1.3 });
    heading(copy, design.headline, 79, design);
    text(copy, "Hero description", design.lead, 21, design.ink, { width: 525 });
    button(copy, "Talk about your options", design);
    text(copy, "Secondary hero link", "Buying a home? Explore Mellon listings  ↗", 16, design.ink, { fontWeight: "800" });
    const broker = frame(node, "Broker credentials", { x: 80, y: 606, width: 530, layout: "horizontal", gap: 28, alignItems: "center" });
    text(broker, "Broker name", "Ian Mellon", 22, design.ink, { fontWeight: "900", width: 150 });
    text(broker, "Broker location and license", "Bakersfield & Shafter\nDRE #01921587", 14, design.ink, { width: 280 });
  } else {
    const copy = frame(node, "Hero copy", { x: 72, y: 70, width: 800, gap: 26 });
    heading(copy, design.headline, 88, design, { lineHeight: 1.02 });
    text(copy, "Hero description", design.lead, 21, design.ink, { width: 560 });
    const actions = frame(copy, "Hero actions", { layout: "horizontal", gap: 14 });
    button(actions, "Explore Mellon listings", design);
    button(actions, "Talk with Ian", design, true);
    mascot(node, 620, 600, { x: 810, y: 100 });
    const band = frame(node, "Property-first hero paths", { x: 72, y: 600, width: 780, layout: "horizontal", gap: 32, padding: [26, 0], stroke: "#123B2D44", strokeWidth: { top: 1 } });
    for (const label of ["Find a home", "Plan a sale", "Explore developments"]) text(band, label, label + "  ↗", 20, design.ink, { width: "fill_container", fontWeight: "850" });
  }
  return node;
}
function specialtyRibbon(parent, design) {
  const node = frame(parent, "Areas of specialty", { layout: "horizontal", padding: [22, 80], gap: 28, justifyContent: "space_between", fill: design.pale });
  for (const label of ["Pre-foreclosure / delinquency", "Probate", "Divorce", "Short sales"]) text(node, label, label, 16, design.ink, { textGrowth: "auto", fontWeight: "800" });
  return node;
}
function listings(parent, design) {
  const node = section(parent, "Mellon listings | priority inventory", design);
  heading(node, design.key === "local" ? "Good places. New possibilities." : "Start with Mellon's listings.", 52, design);
  text(node, "Listing section introduction", "A closer look at properties represented by Mellon. Ask Ian about current availability.", 19, design.ink, { width: 760 });
  if (design.key === "local") {
    photo(node, "Wide illustrative home exterior", "fill_container", 470, "exterior", { cornerRadius: design.radius });
    const caption = frame(node, "Property gallery caption", { layout: "horizontal", gap: 70, alignItems: "center" });
    const description = frame(caption, "Property overview", { width: "fill_container", gap: 14 });
    heading(description, "Modern design. Open-concept living.", 35, design);
    text(description, "Property summary", "Quality finishes and spaces built for today. Ask Ian for available homes, pricing, and property details.", 18, design.ink);
    button(caption, "View Mellon availability", design);
    text(node, "Image disclosure", "Listing preview with illustrative photos of an identical build. Actual finishes and features may vary.", 12, design.ink);
    return node;
  }
  const row = frame(node, "Featured listing presentation", { layout: "horizontal", gap: 36, alignItems: "center" });
  const images = frame(row, "Illustrative property photography", { width: design.key === "clear" ? 650 : 800, gap: 12 });
  photo(images, "Illustrative exterior from client flyer", "fill_container", design.key === "local" ? 370 : 330, "exterior", { cornerRadius: design.radius });
  if (design.key === "clear") {
    const small = frame(images, "Interior gallery", { layout: "horizontal", gap: 12 });
    photo(small, "Illustrative living area", "fill_container", 160, "living", { cornerRadius: design.radius });
    photo(small, "Illustrative kitchen", "fill_container", 160, "kitchen", { cornerRadius: design.radius });
  }
  text(images, "Image disclosure", "Illustrative photos of an identical build. Actual finishes and features may vary.", 12, design.ink, { lineHeight: 1.4 });
  const detail = frame(row, "Listing details preview", { width: "fill_container", gap: 22, padding: [12, 0] });
  text(detail, "Listing preview label", "MELLON LISTING PREVIEW", 12, design.ink, { fontWeight: "900", letterSpacing: 1.4 });
  heading(detail, "Modern design.\nRoom to begin.", 39, design);
  text(detail, "Listing description", "Open-concept living, quality finishes, and spaces built for today.", 19, design.ink);
  text(detail, "Listing availability", "Ask Ian for available homes, pricing, and property details.", 16, design.ink);
  button(detail, "Ask about Mellon listings", design);
  return node;
}
function support(parent, design) {
  const node = section(parent, "Specialist seller support", design, { fill: design.pale });
  const row = frame(node, "Specialist support layout", { layout: design.key === "clear" ? "vertical" : "horizontal", gap: design.key === "clear" ? 35 : 88 });
  const intro = frame(row, "Support introduction", { width: design.key === "clear" ? 760 : 440, gap: 25 });
  heading(intro, design.key === "clear" ? "When selling\nisn't simple." : "Every move has\na story.", 54, design);
  text(intro, "Support description", "Ian specializes in property situations that call for discretion, clear communication, and a practical plan.", 20, design.ink);
  if (design.key !== "clear") button(intro, "Speak privately with Ian", design);
  const options = frame(row, "Specialist services", { width: "fill_container", gap: 0 });
  for (const [title, description, glyph] of specialties) {
    const item = frame(options, title, { layout: "horizontal", gap: 22, padding: [25, 0], stroke: design.ink + "33", strokeWidth: { bottom: 1 } });
    icon(item, glyph, design.ink, 29);
    const copy = frame(item, title + " copy", { gap: 8, width: "fill_container" });
    text(copy, title + " heading", title, 24, design.ink, { fontWeight: "900", lineHeight: 1.2 });
    text(copy, title + " description", description, 17, design.ink);
    icon(item, "arrow-up-right", design.ink, 22);
  }
  if (design.key === "clear") button(node, "Speak privately with Ian", design);
  return node;
}
function development(parent, design) {
  const node = section(parent, "Development opportunities", design);
  heading(node, design.key === "local" ? "What's taking shape locally." : "A brighter future, in the making.", 52, design);
  text(node, "Pipeline introduction", "Explore Mellon's development pipeline across Bakersfield and Shafter.", 19, design.ink);
  const summary = frame(node, "Pipeline summary", { layout: "horizontal", gap: 50, padding: [8, 0, 22, 0] });
  for (const [value, label] of [["8", "total projects"], ["2", "fourplexes"], ["2", "cities"]]) {
    const metric = frame(summary, label, { layout: "horizontal", gap: 16, alignItems: "center", width: "fill_container" });
    text(metric, label + " value", value, 70, design.ink, { fontFamily: design.heading, textGrowth: "auto", lineHeight: 1 });
    text(metric, label + " label", label, 18, design.ink, { fontWeight: "800" });
  }
  const pipeline = frame(node, "Project stages", { layout: "horizontal", gap: 28 });
  for (let i = 0; i < projects.length; i++) {
    const [title, addresses] = projects[i];
    const group = frame(pipeline, title, { width: "fill_container", padding: 28, gap: 24, fill: i === 0 ? design.pale : design.background, cornerRadius: design.radius, stroke: design.ink + "33", strokeWidth: 1 });
    text(group, title + " heading", title, 22, design.ink, { fontWeight: "900" });
    for (const [address, type] of addresses) {
      const line = frame(group, address, { gap: 5 });
      text(line, address + " address", address, 18, design.ink, { fontWeight: "850" });
      text(line, address + " type", type, 15, design.ink);
    }
  }
  text(node, "Pipeline disclosure", "Project stages are from the supplied development flyer. Confirm current status and availability with Ian; plan-check approvals remain subject to agency review.", 13, design.ink);
  button(node, "Discuss a development", design, true);
  return node;
}
function broker(parent, design) {
  const node = section(parent, "Meet Ian and the process", design, { fill: design.pale });
  const row = frame(node, "Broker and process columns", { layout: "horizontal", gap: 85 });
  const intro = frame(row, "Ian Mellon introduction", { width: 480, gap: 22 });
  text(intro, "Broker section label", "PEOPLE. PROPERTIES. SOLUTIONS.", 12, design.ink, { fontWeight: "900", letterSpacing: 1.5 });
  heading(intro, "A local broker.\nA personal approach.", 48, design);
  text(intro, "Broker biography", "Ian Mellon brings a neutral, professional perspective to your next move, with clear information and a focus on your goals.", 20, design.ink);
  text(intro, "Broker credentials", "Ian Mellon\nCalifornia Real Estate Broker\nDRE #01921587", 17, design.ink, { fontWeight: "800" });
  const process = frame(row, "What working together looks like", { width: "fill_container", gap: 35 });
  for (const [title, description] of [["Start with your situation", "Talk privately about the property, your timing, and what matters to you."], ["Understand your options", "Get clear real estate information and discuss the next steps to consider."], ["Make a plan together", "Choose a practical direction for buying, selling, or exploring a development."]]) {
    const item = frame(process, title, { layout: "horizontal", gap: 22 });
    icon(item, "arrow-right", design.ink, 27);
    const copy = frame(item, title + " copy", { gap: 10 });
    text(copy, title + " heading", title, 25, design.ink, { fontWeight: "900" });
    text(copy, title + " description", description, 18, design.ink);
  }
  return node;
}
function market(parent, design) {
  const node = section(parent, "Broader market search | secondary feed", design);
  heading(node, "Looking a little further?", 48, design);
  text(node, "Market search introduction", "Explore more homes around Bakersfield and Shafter, with Ian here to help you make sense of the options.", 19, design.ink, { width: 820 });
  const search = frame(node, "Market search preview", { padding: 32, gap: 26, fill: design.pale, cornerRadius: design.radius });
  const filters = frame(search, "Search filters", { layout: "horizontal", gap: 14, alignItems: "center" });
  for (const label of ["Bakersfield or Shafter", "Any price", "Any beds"]) {
    const field = frame(filters, label, { layout: "horizontal", height: 58, width: "fill_container", padding: [0, 18], alignItems: "center", justifyContent: "space_between", fill: design.background, stroke: design.ink + "44", strokeWidth: 1, cornerRadius: 6 });
    text(field, label + " label", label, 16, design.ink, { fontWeight: "700" });
    icon(field, "caret-down", design.ink, 16);
  }
  button(filters, "Explore homes", design, false, { height: 58 });
  text(search, "Search empty state", "Choose an area to begin your home search.", 18, design.ink);
  text(search, "Concept feed status", "Market search preview. Listing source to be connected.", 12, design.ink);
  return node;
}
function contact(parent, design) {
  const node = section(parent, "Contact Ian", design, { fill: design.pink, padding: [70, 80] });
  const row = frame(node, "Contact layout", { layout: "horizontal", gap: 90 });
  const copy = frame(row, "Contact invitation", { width: 560, gap: 23 });
  heading(copy, "Let's talk about\nyour options.", 56, design);
  text(copy, "Contact reassurance", "A private, no-pressure conversation about your next move.", 21, design.ink);
  text(copy, "Telephone", "(661) 805-2481", 36, design.ink, { fontWeight: "900", href: "tel:+16618052481" });
  text(copy, "Email", "ianmellon@yahoo.com", 20, design.ink, { href: "mailto:ianmellon@yahoo.com" });
  const form = frame(row, "Consultation form concept", { width: "fill_container", gap: 15 });
  for (const label of ["Your name", "Email address", "How can Ian help?"]) {
    const field = frame(form, label, { height: label.startsWith("How") ? 100 : 55, padding: [16, 18], fill: design.background, cornerRadius: 6 });
    text(field, label + " label", label, 16, design.ink);
  }
  button(form, "Request a conversation", design);
  text(form, "Form prototype note", "Design preview. This form does not submit.", 12, design.ink);
  const footer = frame(node, "Footer", { layout: "horizontal", gap: 48, padding: [30, 0, 0, 0], stroke: design.ink + "44", strokeWidth: { top: 1 }, justifyContent: "space_between", alignItems: "center" });
  text(footer, "Footer brand", "mellon", 30, design.ink, { fontFamily: "Archivo Black", textGrowth: "auto" });
  text(footer, "Footer legal", "Ian Mellon • California Real Estate Broker • DRE #01921587", 12, design.ink, { width: "fit_content", textGrowth: "auto" });
  text(footer, "Footer links", "Privacy    Accessibility", 12, design.ink, { textGrowth: "auto" });
  return node;
}

function conceptOverview() {
  const position = FindEmptySpace({ width: 1440, height: 820, padding: 120 });
  const node = frame(document, "Mellon | Concept guide and implementation notes", { x: position.x, y: position.y, width: 1440, padding: 60, gap: 30, fill: "#FFF8F1", clip: true, placeholder: true });
  text(node, "Concept review title", "MELLON / THREE WAYS FORWARD", 42, "#40142B", { fontFamily: "Archivo Black", lineHeight: 1.1 });
  text(node, "Shared strategy", "Reframe the mascot-led hero around a clear brokerage promise. Put Mellon's own properties first. Make specialist seller support easy to find. Keep broader market search secondary.", 22, "#40142B");
  const options = frame(node, "Three concept summaries", { layout: "horizontal", gap: 22 });
  for (const design of conceptData) {
    const card = frame(options, design.name + " summary", { width: "fill_container", padding: 26, gap: 16, fill: design.pale, cornerRadius: 18 });
    text(card, design.name + " title", design.name, 25, design.ink, { fontWeight: "900" });
    text(card, design.name + " idea", design.idea, 17, design.ink);
  }
  const notes = frame(node, "Source and implementation notes", { gap: 15 });
  for (const [title, body] of [
    ["Recommended starting point", "Bright Beginnings preserves the current personality. Borrow Clear Way Forward's careful seller language and Local Opportunity's property emphasis."],
    ["Content integrity", "Property imagery comes from the identical-build flyer and is illustrative. No prices, active listing statuses, customer claims, or testimonials have been invented. Pipeline stages are from the supplied flyer and need confirmation before publication."],
    ["Listing feed", "Use Mellon's own approved inventory in a local CMS first. Broader search is a separate provider slot. Zillow's official Bridge API requires MLS-partner approval; a free Zillow, Realtor.com, or Trulia display feed has not been confirmed. External search links are a practical interim option."],
    ["Interaction and mobile", "Keep the existing exact-logo eye tracking. On mobile: headline, mascot, primary action, then stacked sections. No video background. Respect reduced motion; retain keyboard focus and touch-sized controls."],
    ["Review scope", "Editable landing-page concepts only. The live Next.js homepage is unchanged. Contact forms and market search are visual prototypes."]
  ]) {
    const row = frame(notes, title, { layout: "horizontal", gap: 25 });
    text(row, title + " label", title, 15, "#40142B", { width: 210, fontWeight: "900" });
    text(row, title + " note", body, 15, "#40142B");
  }
  text(node, "API source", "API source: https://www.zillowgroup.com/developers/api/mls-broker-data/mls-listings/", 12, "#40142B", { href: "https://www.zillowgroup.com/developers/api/mls-broker-data/mls-listings/" });
  Update(node, { placeholder: false });
  return node;
}

function mobileStudy(design, desktopId) {
  const position = FindEmptySpace({ width: 390, height: 2100, nodeId: desktopId, direction: "bottom", padding: 120 });
  const page = frame(document, design.name + " | Mobile opening 390px", { x: position.x + 525, y: position.y, width: 390, fill: design.background, clip: true, placeholder: true });
  const nav = frame(page, "Mobile navigation", { layout: "horizontal", padding: [12, 24], height: 76, justifyContent: "space_between", alignItems: "center", fill: design.pink });
  text(nav, "Mobile wordmark", "mellon", 28, design.ink, { fontFamily: "Archivo Black", textGrowth: "auto" });
  const menu = frame(nav, "Open navigation menu", { width: 44, height: 44, alignItems: "center", justifyContent: "center", stroke: design.ink + "44", strokeWidth: 1, cornerRadius: 22 });
  icon(menu, "list", design.ink, 24);
  const heroNode = frame(page, "Mobile hero | stacked copy mascot actions", { padding: [25, 24, 34, 24], gap: 20, fill: design.pink });
  text(heroNode, "Mobile eyebrow", "BAKERSFIELD & SHAFTER REAL ESTATE", 10, design.ink, { fontWeight: "900", letterSpacing: 1 });
  heading(heroNode, design.headline, design.key === "bright" ? 48 : 42, design);
  text(heroNode, "Mobile hero description", design.lead, 17, design.ink);
  mascot(heroNode, "fill_container", 325);
  button(heroNode, design.key === "local" ? "Explore Mellon listings" : "Talk about your options", design, false, { width: "fill_container" });
  button(heroNode, design.key === "local" ? "Talk with Ian" : "Mellon listings", design, true, { width: "fill_container" });
  const supportLinks = frame(page, "Mobile specialist summary", { padding: [26, 24], gap: 8, fill: design.pale });
  text(supportLinks, "Specialist label", "SPECIALIST SELLER SUPPORT", 11, design.ink, { fontWeight: "900", letterSpacing: 1.1 });
  text(supportLinks, "Specialist situations", "Pre-foreclosure / delinquency\nProbate • Divorce • Short sales", 16, design.ink, { fontWeight: "750" });
  const listing = frame(page, "Mobile Mellon listing preview", { padding: [48, 24], gap: 22 });
  heading(listing, "Start with\nMellon's listings.", 31, design);
  photo(listing, "Mobile illustrative home exterior", "fill_container", 230, "exterior", { cornerRadius: design.radius });
  text(listing, "Mobile property title", "Modern design. Room to begin.", 23, design.ink, { fontWeight: "900" });
  text(listing, "Mobile property summary", "Open-concept living and quality finishes. Ask Ian about current availability and property details.", 17, design.ink);
  text(listing, "Mobile photo disclosure", "Illustrative photos of an identical build. Actual finishes and features may vary.", 12, design.ink);
  button(listing, "Ask about Mellon listings", design, false, { width: "fill_container" });
  const continuation = frame(page, "Mobile study annotation", { padding: 24, fill: design.pale });
  text(continuation, "Mobile study continuation", "MOBILE OPENING STUDY / CONTINUES INTO SELLER SUPPORT, DEVELOPMENT, AND CONTACT", 10, design.ink, { fontWeight: "800", letterSpacing: 0.5 });
  Update(page, { placeholder: false });
  return page;
}
