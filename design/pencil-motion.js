const motionDesign = { ...conceptData[0], background: "#FFF9EF", pale: "#F8DEE9", pink: "#E997B7", radius: 24 };
const motionAsset = "./design/scrollcraft/builds/bright-beginnings-motion/assets/";
function motionSection(parent, name, mobile = false, properties = {}) {
  return frame(parent, name, { padding: mobile ? [48, 24] : [80, 80], gap: mobile ? 24 : 34, fill: motionDesign.background, ...properties });
}
function motionButton(parent, label = "Let's talk", mobile = false, secondary = false) {
  return button(parent, label, motionDesign, secondary, mobile ? { width: "fill_container" } : {});
}
function referenceHero(parent, mobile = false) {
  return Insert(parent, { type: "rectangle", name: "LIVE HERO / unchanged reference capture", width: "fill_container", height: mobile ? 1189 : 900, fill: { type: "image", url: motionAsset + (mobile ? "live-hero-mobile.png" : "live-hero-desktop.png"), mode: "contain" }, context: "Protected live hero. Reference image only. Preserve production markup, scale, eye tracking, cursor, navigation and copy." });
}
function motionIntro(parent, mobile = false) {
  const node = motionSection(parent, "Mellon listings introduction", mobile, { padding: mobile ? [48,24,24,24] : [72,80,40,80], gap: 18 });
  heading(node, "A closer look at home.", mobile ? 36 : 66, motionDesign);
  text(node, "Listing introduction", "Start with Mellon's own properties. Find a space that fits your next chapter.", mobile ? 17 : 21, motionDesign.ink, { width: mobile ? "fill_container" : 720 });
  return node;
}
function motionProperty(parent, mobile = false) {
  const node = motionSection(parent, "Signature property reveal / resolved state", mobile, { padding: mobile ? [20,24,48,24] : [20,80,68,80], gap: 26 });
  photo(node, "Property reveal aperture", "fill_container", mobile ? 240 : 510, "exterior", { cornerRadius: 24, context: "Desktop: two pink panels translate out from the center as this photo settles from scale 1.06 to 1. Mobile and reduced motion show this complete view without pinning." });
  const caption = frame(node, "Property caption and action", { layout: mobile ? "vertical" : "horizontal", gap: 24, alignItems: mobile ? "start" : "center" });
  const copy = frame(caption, "Property introduction", { gap: 10 });
  heading(copy, "Modern design.\nNew possibilities.", mobile ? 30 : 40, motionDesign);
  text(copy, "Property description", "Open-concept living. Quality finishes. Ask Ian about current Mellon availability.", mobile ? 16 : 19, motionDesign.ink);
  motionButton(caption, "Mellon listings", mobile);
  text(node, "Required property photo disclosure", "Illustrative photos of an identical build. Actual finishes, colors, dimensions and features may vary.", 12, motionDesign.ink);
  return node;
}
function motionGallery(parent, mobile = false) {
  const node = motionSection(parent, "Interior details / gentle depth", mobile, { padding: mobile ? [0,24,48,24] : [0,80,80,80], gap: 20 });
  const row = frame(node, "Asymmetric interior composition", { layout: mobile ? "vertical" : "horizontal", gap: mobile ? 26 : 40 });
  const left = frame(row, "Living space", { width: mobile ? "fill_container" : 750, gap: 16 });
  photo(left, "Illustrative living room", "fill_container", mobile ? 210 : 360, "living", { cornerRadius: 24 });
  text(left, "Living caption", "Room for everyday life.", mobile ? 20 : 28, motionDesign.ink, { fontWeight: "900" });
  const right = frame(row, "Kitchen detail", { padding: mobile ? 0 : [64,0,0,0], gap: 16 });
  photo(right, "Illustrative kitchen", "fill_container", mobile ? 210 : 300, "kitchen", { cornerRadius: 24 });
  text(right, "Kitchen caption", "Details that make a home.", mobile ? 20 : 28, motionDesign.ink, { fontWeight: "900" });
  return node;
}
function motionSupport(parent, mobile = false) {
  const node = motionSection(parent, "Specialist support / interactive choices", mobile, { fill: motionDesign.pale, gap: mobile ? 24 : 38 });
  heading(node, "Some moves need\nmore care.", mobile ? 38 : 64, motionDesign);
  text(node, "Specialist introduction", "Ian specializes in complex property situations. Clear information, discretion, and a practical next step.", mobile ? 17 : 20, motionDesign.ink, { width: mobile ? "fill_container" : 780 });
  const row = frame(node, "Situation selector and guidance", { layout: mobile ? "vertical" : "horizontal", gap: mobile ? 22 : 70 });
  const list = frame(row, "Accessible situation accordion", { width: mobile ? "fill_container" : 590, gap: 0 });
  for (let i=0;i<specialties.length;i++) {
    const line=frame(list,specialties[i][0]+" selector",{layout:"horizontal",gap:16,padding:mobile?[21,0]:[23,0],alignItems:"center",stroke:"#40142B25",strokeWidth:{bottom:1}});
    text(line,"Situation name",specialties[i][0],mobile?21:30,motionDesign.ink,{fontWeight:"850",lineHeight:1.18});
    icon(line,i===0?"minus":"plus",motionDesign.ink,22);
  }
  const detail=frame(row,"Selected situation / pre-foreclosure and delinquency",{padding:mobile?25:38,gap:22,fill:motionDesign.background,cornerRadius:24});
  icon(detail,"house-line",motionDesign.ink,36);
  heading(detail,"Get clear on\nyour next step.",mobile?29:40,motionDesign);
  text(detail,"Selected guidance","Talk privately about the property, your timing, and questions to discuss with your lender.",mobile?17:20,motionDesign.ink);
  motionButton(detail,"Let's talk",mobile);
  text(detail,"Support reassurance","A private, no-pressure conversation.",13,motionDesign.ink);
  return node;
}
function motionDevelopment(parent, mobile = false) {
  const node=motionSection(parent,"Development / stage explorer",mobile,{gap:30});
  heading(node,"Good things\nare taking shape.",mobile?38:64,motionDesign);
  text(node,"Development introduction","Eight projects across Bakersfield and Shafter. Explore the next chapter of local living.",mobile?17:20,motionDesign.ink,{width:mobile?"fill_container":780});
  const tabs=frame(node,"Project stage tabs",{layout:"horizontal",gap:mobile?6:12});
  for(let i=0;i<3;i++){
    const t=frame(tabs,projects[i][0],{padding:mobile?[14,9]:[17,26],width:mobile?"fill_container":"fit_content",height:mobile?72:58,justifyContent:"center",cornerRadius:mobile?14:40,fill:i===0?motionDesign.ink:motionDesign.pale});
    text(t,"Stage label",projects[i][0],mobile?13:17,i===0?motionDesign.background:motionDesign.ink,{textGrowth:mobile?"fixed-width":"auto",fontWeight:"850",textAlign:"center",lineHeight:1.2});
  }
  const ledger=frame(node,"Under construction / selected stage",{layout:mobile?"vertical":"horizontal",gap:mobile?0:42});
  for(const [address,type] of projects[0][1]){
    const card=frame(ledger,address+" project",{gap:12,padding:mobile?[24,0]:[26,0],stroke:"#40142B30",strokeWidth:{top:1}});
    text(card,"Property type",type,16,motionDesign.ink,{fontWeight:"750"});
    heading(card,address,mobile?28:34,motionDesign);
    text(card,"Project stage","Under construction",14,motionDesign.ink);
  }
  text(node,"Stage confirmation","Stages are from the supplied development flyer. Confirm current status and availability with Ian.",12,motionDesign.ink);
  motionButton(node,"Let's talk",mobile,true);
  return node;
}
function motionBroker(parent, mobile = false) {
  const node=motionSection(parent,"Meet Ian / human guidance",mobile,{fill:motionDesign.pale,gap:30});
  heading(node,"A person in\nyour corner.",mobile?38:64,motionDesign);
  text(node,"Ian introduction","Ian Mellon brings a neutral, professional perspective to your next move, with clear information and a focus on your goals.",mobile?17:21,motionDesign.ink,{width:mobile?"fill_container":820});
  text(node,"Verified broker identity","Ian Mellon\nCalifornia Real Estate Broker | DRE #01921587",16,motionDesign.ink,{fontWeight:"850"});
  const steps=frame(node,"The working relationship",{layout:mobile?"vertical":"horizontal",gap:mobile?26:52,padding:[16,0]});
  for(const [verb,body,glyph] of [["Talk it through.","Your property, your timing, your priorities.","chat-circle"],["See your options.","Clear real estate information for your situation.","compass"],["Plan the move.","A practical direction, with a person beside you.","key"]]){
    const step=frame(steps,verb,{gap:15});
    icon(step,glyph,motionDesign.ink,32);
    text(step,"Step title",verb,mobile?25:29,motionDesign.ink,{fontWeight:"900"});
    text(step,"Step description",body,mobile?17:18,motionDesign.ink);
  }
  return node;
}
function motionMarket(parent, mobile = false) {
  const node=motionSection(parent,"Broader search / secondary provider preview",mobile,{gap:24});
  heading(node,"More places to explore.",mobile?33:48,motionDesign);
  text(node,"Market introduction","Looking beyond Mellon's listings? Start with an area, then talk through the options with Ian.",mobile?17:20,motionDesign.ink,{width:mobile?"fill_container":800});
  const search=frame(node,"Search controls",{layout:mobile?"vertical":"horizontal",gap:14,alignItems:mobile?"start":"end"});
  for(const [label,value] of [["Area","Bakersfield or Shafter"],["Budget","Any price"]]){
    const field=frame(search,label+" field",{gap:10});
    text(field,"Field label",label,14,motionDesign.ink,{fontWeight:"850"});
    const input=frame(field,"Select "+label,{layout:"horizontal",height:58,padding:[0,18],alignItems:"center",gap:16,fill:motionDesign.pale,cornerRadius:10});
    text(input,"Selected value",value,17,motionDesign.ink);
    icon(input,"caret-down",motionDesign.ink,18);
  }
  motionButton(search,"Find your home",mobile);
  text(node,"Feed prototype status","Search preview. An approved listing provider is still to be connected.",12,motionDesign.ink);
  return node;
}
function motionContact(parent, mobile = false) {
  const node=motionSection(parent,"Contact / stable final destination",mobile,{fill:motionDesign.pink,gap:28});
  heading(node,"Your next move.\nLet's talk.",mobile?42:86,motionDesign);
  text(node,"Contact reassurance","A private conversation. A clearer way forward.",mobile?18:24,motionDesign.ink);
  const links=frame(node,"Direct contact choices",{layout:mobile?"vertical":"horizontal",gap:mobile?18:44,padding:[10,0,22,0]});
  text(links,"Phone","(661) 805-2481",mobile?29:40,motionDesign.ink,{textGrowth:"auto",fontWeight:"900",href:"tel:+16618052481"});
  text(links,"Email","ianmellon@yahoo.com",mobile?20:27,motionDesign.ink,{textGrowth:"auto",href:"mailto:ianmellon@yahoo.com"});
  const foot=frame(node,"Brokerage footer",{layout:mobile?"vertical":"horizontal",gap:20,justifyContent:"space_between",padding:[28,0,0,0],stroke:"#40142B33",strokeWidth:{top:1},alignItems:mobile?"start":"center"});
  text(foot,"Mellon footer wordmark","mellon",mobile?32:40,motionDesign.ink,{fontFamily:"Archivo Black",textGrowth:"auto"});
  text(foot,"Broker license","Ian Mellon | California Real Estate Broker\nDRE #01921587",12,motionDesign.ink,{width:mobile?"fill_container":410});
  return node;
}
function motionNotes() {
  const pos=FindEmptySpace({width:1440,height:1050,nodeId:"u7Hqx",direction:"right",padding:140});
  const node=frame(document,"04 Bright Beginnings / Motion direction",{x:pos.x,y:0,width:1440,padding:60,gap:28,fill:motionDesign.background,clip:true,placeholder:true});
  heading(node,"BRIGHT BEGINNINGS.\nA LITTLE MORE WONDER.",48,motionDesign);
  text(node,"Protected hero instruction","KEEP THE LIVE HERO EXACTLY AS IT IS.",22,motionDesign.ink,{fontWeight:"900"});
  text(node,"Direction summary","A more expressive continuation of concept 01. One dramatic property reveal earns attention. Calmer, visitor-controlled sections make room for real questions.",22,motionDesign.ink);
  const rows=[
    ["Property reveal","Two pink panels open onto the supplied exterior. This is the only pinned scene. The caption and identical-build disclosure stay readable."],
    ["Specialist guidance","Pre-foreclosure / delinquency, probate, divorce and short sales become clear, selectable situations. Use a gentle 160ms content transition."],
    ["Development explorer","Use three stage tabs to organize the eight real flyer projects. Show the relevant group without a long inventory dump."],
    ["Mobile and reduced motion","Remove pinning and parallax. Show complete photography immediately. Stack galleries and retain usable disclosure controls."],
    ["Design boundaries","The hero shown below is an unchanged screenshot for context. Everything below it is editable. The live site and its source files remain untouched."],
    ["Companion prototype","A separate HTML motion study demonstrates the proposed transition and controls. Its hero is a clearly identified reference image."]
  ];
  for(const [label,body]of rows){
    const row=frame(node,label,{layout:"horizontal",gap:30,padding:[18,0],stroke:"#40142B22",strokeWidth:{top:1}});
    text(row,"Note label",label,18,motionDesign.ink,{width:250,fontWeight:"900"});
    text(row,"Note text",body,18,motionDesign.ink);
  }
  Update(node,{placeholder:false});
  return node;
}
function motionStoryboard() {
  const pos=FindEmptySpace({width:2400,height:1200,nodeId:"jzXfg",direction:"top",padding:140});
  const board=frame(document,"04 Bright Beginnings / Property reveal storyboard",{x:pos.x,y:pos.y,width:2400,padding:60,gap:32,fill:motionDesign.background,clip:true,placeholder:true});
  heading(board,"THE PINK WELCOME OPENS INTO A HOME.",50,motionDesign);
  text(board,"Storyboard introduction","One memorable scroll moment after the unchanged live hero. Frames captured from the working motion study.",24,motionDesign.ink);
  const sequence=frame(board,"Opening to resolved sequence",{layout:"horizontal",gap:30});
  const states=[
    ["01  WELCOME","reveal-opening.png","Pink panels introduce the property. The listing caption and identical-build disclosure stay readable."],
    ["02  OPEN THE VIEW","reveal-middle.png","Panels move apart in opposite directions as the visitor scrolls. The exterior settles gently from 1.06x scale."],
    ["03  ARRIVE HOME","reveal-resolved.png","The photo fills the aperture. A short resolved hold lets the visitor see the home before continuing."]
  ];
  for(const [label,file,body]of states){
    const col=frame(sequence,label,{gap:22});
    text(col,"State label",label,22,motionDesign.ink,{fontWeight:"900"});
    Insert(col,{type:"rectangle",name:label+" / actual prototype frame",width:"fill_container",height:415,cornerRadius:12,fill:{type:"image",url:motionAsset+file,mode:"contain"}});
    text(col,"State explanation",body,20,motionDesign.ink);
  }
  const notes=frame(board,"Motion implementation notes",{layout:"horizontal",gap:60,padding:[30,0,0,0],stroke:"#40142B33",strokeWidth:{top:1}});
  for(const [title,body]of [
    ["Desktop choreography","One pinned encounter, 2.1 viewport heights. Panels finish opening before the final hold. Scrolling backward reverses the reveal."],
    ["Phone + reduced motion","Show the finished photograph immediately. Remove pinning, doors and parallax. Keep every caption, control and contact option available."],
    ["After the peak","Interior images move by only a few pixels. Specialist choices change gently; development tabs reveal a selected stage. The contact close stays still."]
  ]){
    const col=frame(notes,title,{gap:14});
    text(col,"Note title",title,22,motionDesign.ink,{fontWeight:"900"});
    text(col,"Note body",body,20,motionDesign.ink);
  }
  text(board,"Working preview link","TRY THE MOTION STUDY  →  http://127.0.0.1:3021/",22,motionDesign.ink,{fontWeight:"900",href:"http://127.0.0.1:3021/"});
  Update(board,{placeholder:false});
  return board;
}
