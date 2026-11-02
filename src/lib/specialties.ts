export type Specialty = {
  slug: string; label: string; title: string; description: string; heading: string; promise: string; intro: string;
  image: string; imageAlt: string; overviewTitle: string; overview: string;
  services: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  checklist: string[]; faqs: { question: string; answer: string }[];
  resource: { label: string; href: string }; note: string;
};

export const specialties: Specialty[] = [
  {
    slug: "pre-foreclosure-real-estate-bakersfield", label: "Pre-foreclosure",
    title: "Pre-Foreclosure Real Estate Bakersfield | Mellon",
    description: "Considering selling a house before foreclosure in Bakersfield? Talk with broker Ian Mellon about your property, timing, and practical next steps.",
    heading: "Pre-foreclosure real estate in Bakersfield.", promise: "More clarity. A way forward.",
    intro: "When mortgage payments become difficult, a clear conversation can make the next step feel more manageable. Explore the real estate side of your options with Ian Mellon.",
    image: "pre-foreclosure", imageAlt: "Illustrative cream California ranch home with a green front door and flowering garden.",
    overviewTitle: "Start with where you are.",
    overview: "Selling a house before foreclosure starts with understanding the property, the money owed, and the time available. Ian works with Bakersfield and Kern County homeowners to assess a possible sale, prepare the home for the market, and coordinate the transaction. You can begin with questions, even if you have not decided to sell.",
    services: [
      { title: "A realistic view of your property", text: "Discuss the home's condition, comparable properties, likely buyer interest, and selling expenses. A practical pricing conversation helps you consider whether a sale fits your situation." },
      { title: "A plan shaped around your timing", text: "Share any notices or dates with the appropriate professionals. Ian can discuss a marketing and sale plan while your servicer or attorney confirms the status of your loan and any legal deadlines." },
      { title: "Support through the sale", text: "Get help with property preparation, showings, offers, and coordination with escrow and title. Keep the people involved informed as the transaction moves forward." },
    ],
    steps: [
      { title: "Talk through the situation", text: "Start with your address, your goals, and any time-sensitive concerns. There is no need to have every answer before calling." },
      { title: "Review a possible sale", text: "Consider price, property condition, payoff information, and estimated selling costs together." },
      { title: "Choose the next step", text: "If selling makes sense and the timing allows, build a plan for listing and responding to offers." },
    ],
    checklist: ["Property address and current condition", "Recent mortgage statements or payoff information", "Any notices and dates you have received", "Your goals for timing and your next home"],
    faqs: [
      { question: "Can I sell my house before foreclosure in Bakersfield?", answer: "A sale may be possible before a foreclosure is completed, depending on the property's status, available time, and the amounts that must be paid. Ian can discuss a potential sale, while your loan servicer and legal adviser confirm your specific options and deadlines." },
      { question: "Does listing my home stop foreclosure?", answer: "Putting a property on the market does not itself pause or stop foreclosure. Confirm any sale date or agreement directly with your servicer and seek legal guidance promptly when deadlines are involved." },
      { question: "What if the sale price will not cover the mortgage?", answer: "That situation may require a short sale or another arrangement with the lender. Approval cannot be assumed. Ian can discuss the sale process and the questions to raise with your servicer and advisers." },
      { question: "Do I have to decide to sell before contacting Ian?", answer: "No. The first conversation can focus on your property and the information you need to decide. If keeping your home is your goal, your servicer or a HUD-approved housing counselor can discuss retention options." },
    ],
    resource: { label: "California homeowner rights and foreclosure resources", href: "https://oag.ca.gov/hbor" },
    note: "Ian provides real estate brokerage services. A listing or inquiry does not stop foreclosure; legal deadlines and lender decisions require direct confirmation.",
  },
  {
    slug: "probate-real-estate-bakersfield", label: "Probate & inherited property",
    title: "Probate Real Estate Bakersfield | Inherited Home Sales",
    description: "Support for probate and inherited property sales in Bakersfield and Kern County. Ian Mellon helps with pricing, preparation, and real estate sale coordination.",
    heading: "Probate real estate in Bakersfield.", promise: "A thoughtful next chapter.",
    intro: "An inherited home can hold a lifetime of memories and a long list of decisions. Get patient, practical support for the real estate side of the process.",
    image: "probate", imageAlt: "Illustrative lived-in California living room with an ivory chair, oak furnishings, and garden light.",
    overviewTitle: "Care for the details. Respect for the home.",
    overview: "Selling inherited real estate involves more than choosing a listing price. Ian helps families and authorized representatives in Bakersfield and Kern County organize property decisions, understand the market, and prepare for a sale. The approach can account for an occupied home, a vacant property, or an owner handling arrangements from out of town.",
    services: [
      { title: "Property and market review", text: "Assess the home's condition and comparable properties, then discuss a pricing strategy and likely sale preparation costs. Decide which tasks deserve attention before the property is listed." },
      { title: "Practical preparation", text: "Plan access, photographs, showings, and the presentation of the home. Talk through whether a limited preparation plan or selling in its current condition better fits the estate's goals." },
      { title: "Coordination with your team", text: "Keep the real estate process aligned with the authorized representative, probate attorney, escrow, and title company. The legal team confirms who may sign and which approvals are needed." },
    ],
    steps: [
      { title: "Clarify the starting point", text: "Discuss the property, who is handling the estate, and what your attorney has established about authority to sell." },
      { title: "Make a property plan", text: "Review condition, access, preparation priorities, and a market-based listing approach." },
      { title: "Coordinate the transaction", text: "Manage marketing and offers while the estate's advisers address the required legal steps." },
    ],
    checklist: ["Property address, occupancy, and access details", "Contact information for the authorized representative", "Your probate attorney's contact information, if applicable", "Known maintenance needs and existing property records"],
    faqs: [
      { question: "Does every inherited home have to go through probate?", answer: "No. The way property transfers after a death depends on how it was held and the circumstances of the estate. A California probate attorney can determine the appropriate process before sale arrangements are finalized." },
      { question: "What should I look for in a probate Realtor in Bakersfield?", answer: "Ask about property preparation, communication with an estate's legal team, local pricing, and how the sale process will be coordinated. Ian Mellon is a California real estate broker, DRE #01921587, available to discuss the brokerage services your property needs." },
      { question: "Can you help if I live outside Kern County?", answer: "Yes. Discuss your location and available property access with Ian so that communication, preparation, and showings can be planned around your circumstances." },
      { question: "Does a probate sale require court approval?", answer: "The requirements depend on the estate and the representative's authority. Your attorney should confirm whether court involvement, notice, or other approvals apply. Ian coordinates the real estate work around that guidance." },
    ],
    resource: { label: "California Courts guide to property after someone dies", href: "https://selfhelp.courts.ca.gov/probate" },
    note: "Authority to sell, probate requirements, and tax consequences are determined with your legal and tax advisers. Ian handles real estate brokerage and sale coordination.",
  },
  {
    slug: "short-sale-realtor-bakersfield", label: "Short sales",
    title: "Short Sale Real Estate Bakersfield & Kern County | Mellon",
    description: "Explore short sale real estate in Bakersfield and Kern County with Ian Mellon. Discuss pricing, lender approval, and the steps involved in a potential sale.",
    heading: "Short sale real estate in Bakersfield.", promise: "Understand the possibilities.",
    intro: "When a property's sale may not cover what is owed, the questions can add up quickly. Talk through a potential short sale with a local broker who keeps the real estate process clear.",
    image: "short-sale", imageAlt: "Illustrative modest cream bungalow in California with sage trim and drought-tolerant landscaping.",
    overviewTitle: "A sale with a different set of moving parts.",
    overview: "Short sale real estate in Kern County requires attention to the property and the lender's approval process. Ian helps Bakersfield-area sellers consider pricing, prepare a listing, and communicate through a potential transaction. A short sale is a sale for less than the mortgage debt, and the lender or servicer must agree to the arrangement.",
    services: [
      { title: "Market-based pricing", text: "Review the property's condition and comparable sales so that a potential listing reflects the market. Compare likely proceeds with the financial information supplied by the seller and lender." },
      { title: "An organized sale process", text: "Prepare the listing, coordinate buyer access, and review offers. Keep the transaction's real estate documents organized for the people evaluating the proposed sale." },
      { title: "Clear expectations", text: "Discuss approval conditions, communication, and possible delays. An accepted offer from a buyer is different from the lender's approval of a short sale." },
    ],
    steps: [
      { title: "Review the property and goals", text: "Start with the address, property condition, approximate loan balance, and why you are considering selling." },
      { title: "Contact the loan servicer", text: "Ask about its requirements and the documentation it needs to evaluate a short sale." },
      { title: "Coordinate an offer for review", text: "If you proceed, Ian handles the real estate sale work alongside the lender, escrow, and your advisers." },
    ],
    checklist: ["Recent loan statements and any other liens", "Property condition and occupancy details", "Your loan servicer's contact information", "Questions about approval, timing, and financial consequences"],
    faqs: [
      { question: "What is a short sale?", answer: "A short sale is a property sale for less than the amount owed on the mortgage. It requires the lender or servicer's agreement. The terms, including how any remaining balance is handled, need to be confirmed before proceeding." },
      { question: "What should I ask a short sale Realtor?", answer: "Ask how pricing, buyer communication, lender review, and escrow will be coordinated. Also ask which questions need a lender, attorney, or tax professional. Ian Mellon can explain the real estate brokerage services he provides for a potential short sale." },
      { question: "Is a short sale guaranteed to be approved?", answer: "No. The lender's requirements and decisions control approval. Marketing a property or accepting a buyer's offer does not guarantee a short sale will close." },
      { question: "Will a short sale affect my taxes or credit?", answer: "It can have financial and credit consequences that depend on your situation. Discuss those questions with your lender, a qualified tax professional, and legal counsel before deciding." },
    ],
    resource: { label: "Consumer Financial Protection Bureau: What is a short sale?", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-short-sale-en-290/" },
    note: "Short sales require lender approval. Ian does not guarantee approval, debt forgiveness, credit outcomes, or a particular closing date.",
  },
  {
    slug: "divorce-real-estate-bakersfield", label: "Divorce real estate",
    title: "Divorce Real Estate Services Bakersfield | Mellon",
    description: "Selling a house during divorce in Bakersfield? Ian Mellon provides practical real estate support for pricing, preparation, showings, and sale coordination.",
    heading: "Divorce real estate services in Bakersfield.", promise: "Clear steps through change.",
    intro: "When life is changing, the home can be one of the biggest decisions. Get a calm, organized approach to the real estate side of selling a shared property.",
    image: "divorce", imageAlt: "Illustrative sunlit breakfast room with an oak table, two green chairs, and a doorway to a garden.",
    overviewTitle: "A practical plan for a personal decision.",
    overview: "Selling a house during divorce brings property decisions into an already demanding time. Ian helps Bakersfield and Kern County homeowners work through pricing, preparation, access, and offers with a clear communication plan. The aim is to keep the sale organized while the parties and their attorneys address ownership, authority, and the terms of their agreement.",
    services: [
      { title: "A shared view of the market", text: "Discuss comparable properties, the home's condition, and expected selling costs. Use concrete market information to support the pricing conversation." },
      { title: "Clear communication and access", text: "Agree on how property updates, showings, and offers will be communicated. Plan practical access arrangements around the people living in the home." },
      { title: "Coordinated next steps", text: "Work through listing preparation and the transaction with escrow, title, and the parties' advisers. Keep real estate tasks and responsibilities visible as decisions are made." },
    ],
    steps: [
      { title: "Discuss the sale requirements", text: "Identify the property, the people involved, and any instructions your attorneys have provided." },
      { title: "Build an agreed property plan", text: "Talk through preparation, pricing, communication, and showing arrangements before listing." },
      { title: "Review offers and move forward", text: "Coordinate the real estate transaction around the approvals and terms established by the parties and their legal advisers." },
    ],
    checklist: ["Property address and occupancy details", "An agreed point of contact or communication plan", "Attorney instructions relevant to the property sale", "Questions about preparation, showings, and moving dates"],
    faqs: [
      { question: "Can Ian help both owners understand the sale process?", answer: "Ian can discuss a clear communication plan and explain the real estate steps to the people involved. Representation and agency relationships must be discussed and agreed as appropriate to the transaction." },
      { question: "Who decides how the sale proceeds are divided?", answer: "That is a legal and financial matter for the parties, their attorneys, and any applicable court orders. Ian's role is real estate brokerage, not deciding ownership rights or the division of proceeds." },
      { question: "Can the house be sold while someone is still living there?", answer: "Occupied homes can be marketed, but access, photographs, preparation, and showings need a workable plan. Discuss the living arrangements and any relevant restrictions before the home is listed." },
      { question: "How do we choose a listing price?", answer: "Ian can prepare a market-based pricing discussion using the property's condition and comparable properties. The authorized sellers decide how to proceed within the requirements of their agreement and legal advice." },
    ],
    resource: { label: "California Courts: property and debts in divorce", href: "https://selfhelp.courts.ca.gov/divorce/property-debts" },
    note: "Real estate services do not replace independent legal advice. Your attorneys should confirm authority, applicable orders, and the treatment of sale proceeds.",
  },
  {
    slug: "foreclosure-property-solutions", label: "Foreclosure property solutions",
    title: "Foreclosure Property Solutions in Kern County | Mellon",
    description: "Discuss foreclosure property solutions, notice of default property sales, and distressed real estate in Bakersfield and Kern County with broker Ian Mellon.",
    heading: "Foreclosure property solutions.", promise: "A conversation. A clearer direction.",
    intro: "If a notice or a change in circumstances has made your property feel overwhelming, start with a practical conversation about the real estate options available to you.",
    image: "foreclosure-solutions", imageAlt: "Illustrative California garden path leading to a cream stucco home's green front door.",
    overviewTitle: "Look at the property. Understand the situation.",
    overview: "Distressed property solutions begin with the facts: ownership, condition, loan status, and timing. Ian works with Bakersfield and Kern County property owners considering a sale, including notice of default property sales. This page focuses on evaluating a property and organizing a possible transaction when there are urgent or complicated circumstances.",
    services: [
      { title: "Property sale assessment", text: "Discuss the home's condition, possible buyer audience, pricing, and the practical work needed to bring it to market. Consider whether a sale is realistic within the available time." },
      { title: "An organized set of next steps", text: "Identify the information escrow, title, your lender, and advisers need. Keep the sale-related tasks clear while the appropriate professionals address legal and loan questions." },
      { title: "Connections to the right questions", text: "If keeping the home is your goal, speak with your loan servicer or a HUD-approved housing counselor about retention options. Ian can help evaluate the real estate sale path when you are considering moving on." },
    ],
    steps: [
      { title: "Identify any urgent dates", text: "Read notices carefully and contact your servicer or attorney promptly. Share the timing with Ian when discussing a sale." },
      { title: "Assess the sale path", text: "Review property condition, market expectations, and the information needed about loans or liens." },
      { title: "Coordinate the people involved", text: "If a sale is appropriate, align the real estate work with escrow, title, the lender, and your advisers." },
    ],
    checklist: ["The property address and your relationship to it", "Copies of notices with any sale or response dates", "Loan, lien, and title information you already have", "Whether your goal is to sell or explore keeping the home"],
    faqs: [
      { question: "What foreclosure assistance does Mellon provide?", answer: "Mellon provides real estate brokerage services for owners considering a property sale. Loan modifications, legal representation, and housing counseling are separate services handled by your servicer, attorney, or a qualified housing counselor." },
      { question: "Can I discuss selling after receiving a notice of default?", answer: "Yes, but available options and timing depend on the specific property and loan status. A notice of default is a serious step in the foreclosure process. Confirm dates directly and obtain legal guidance promptly." },
      { question: "Is this the same as the pre-foreclosure service?", answer: "The services overlap. The pre-foreclosure page focuses on homeowners considering a sale when payments have become difficult. Here, the focus is on assessing distressed property circumstances, notices, and coordinating a possible sale." },
      { question: "Does contacting Ian postpone a trustee sale?", answer: "No. Calling, submitting an inquiry, or listing a home does not postpone a sale. Only rely on confirmed information from the parties with authority over the foreclosure and your legal adviser." },
    ],
    resource: { label: "Consumer Financial Protection Bureau: avoiding foreclosure", href: "https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/avoid-foreclosure/" },
    note: "No guaranteed foreclosure prevention or outcome is offered. Contact your servicer and legal adviser promptly about notices, deadlines, or a scheduled sale.",
  },
];

export const getSpecialty = (slug: string) => specialties.find(item => item.slug === slug);
