# Vijayapna Events: site plan and content

Written before the build, rechecked against the rules at the bottom, then built.

## 1. Direction

| Decision | Choice | Why |
| --- | --- | --- |
| Look | **Atelier**: limewash paper, deep umber ink, one slate signal, cotton card stock with fibre, hairlines, photographs hung like matted prints | An events house hands people paper (invitations, passes, badges). The site is built from that paper instead of dark luxury clichés. |
| Background rhythm | **One continuous paper for every page, top to bottom.** No light/dark/light/dark bands. Depth comes from card stock, rules, photographs and a slow luminous "air" behind the hero and the closing card. | Your brief: no alternating section backgrounds. |
| Display face | **Sentient Light** (Indian Type Foundry, via Fontshare) | A modern high-waisted serif with real elegance at light weights, still clean at 16px. Fancy, but it reads. |
| Body face | **Hanken Grotesk** | Quiet, open grotesk; keeps lists, tables and forms easy to scan. |
| Accent | Slate blue (oklch 41% 0.075 248), under 5% of any screen | Gold-on-black is the AI default for "luxury". Slate on limewash looks like ink on paper. |
| Occasion colours | Rose (weddings), slate-blue (exhibitions), ochre (corporate) as "stains" on card stock only | Lets each vertical own a colour without painting whole sections. |

## 2. The unique things

1. **The three cards (home hero).** A wedding invitation, an exhibitor's stall pass and a delegate badge, printed on cotton stock and fanned beside a matted print. They tilt toward the pointer with a moving light sheen; hovering one swaps the print to that occasion; clicking one opens its page with a cross-page morph.
2. **The brief, written as an invitation (closing card, every page).** Pick occasion, city, month and guests; the card typesets the sentence live in letterpress ("A royal wedding in Udaipur, in February, for about 600 guests."). "Send the brief" opens the visitor's email app with it filled in.
3. **The living air.** A WebGL field of cream and amber veils drifting behind the hero; the pointer parts it, and hovering an occasion tints it.
4. Page-specific: an interactive **four-day wedding itinerary** (weddings), a **hall plan you can explore stall by stall** that draws itself (exhibitions), a **badge on a lanyard** you can swing and a **show sheet with a live cue marker** (corporate).

## 3. Motion inventory

Hero headline rises line by line · cards deal in, tilt and sheen · air drifts, parts and tints · scroll reveals (staggered) · scrubbed statement wipe · pinned "how an event runs" chapter whose object changes each stage · strips unfurl and the chosen one drops on its thread · index rows filter and swap a preview print · counters tick on figures · photos settle in their frames · hall plan builds stall by stall · countdown rule fills with scroll · show-sheet cue marker follows scroll · lanyard badge swings · cross-page view transitions. Every one has a reduced-motion fallback and the page is complete without JavaScript.

## 4. Pages and content

### Home (`index.html`)

- **Nav** (masthead bar): Royal weddings · Exhibitions · Corporate events | Vijayapna | Our work · Plan an event
- **Hero.** *From the mandap to the main stage.* Royal weddings, exhibitions and corporate events, run by one Jaipur team. [Plan an event] [See the work]
- **Statement.** "A wedding for 900 and a sales summit for 900 need the same thing: someone who walked the venue at four in the morning." Wall text: Vijayapna Events is the new events house of the Vijayapna group. One lead planner stays with you from the first call to the last vendor paid. Figures: 212 events run since 2011 · 40 planners and floor managers · 14 palaces we hold dates at · 4 offices.
- **Three kinds of occasion** (strips on a rail, each opens a panel and its page): Royal weddings / Exhibitions / Corporate events, each with one line, four things we handle and a link.
- **How an event runs with us** (pinned chapter): I. The brief · II. The plan · III. The walk-through · IV. The night · V. The morning after.
- **Events our team has run** (filterable index with preview prints): 8 sample events.
- **Four days at City Palace** (one event opened as a case): photo, facts, one family quote.
- **Four offices, one number** (Jaipur, Udaipur, New Delhi, Mumbai).
- **Start with four details** (the brief card) + email and phone.
- **Footer** (colophon): address, links, photo credits.

### Royal weddings (`royal-weddings.html`)

- **Hero.** *A palace wedding, day by day.* Palace, fort and lake-hotel weddings across Rajasthan, for 150 to 1,500 guests. Print: Umaid Bhawan colonnade.
- **Four days, in order**: Day 1 Arrivals and mehendi · Day 2 Haldi and sangeet · Day 3 Baraat and pheras · Day 4 Reception and farewell (times, ceremony notes, a photo each).
- **What we take off your hands**: venues and rooms, guest travel, décor and flowers, food, rituals and priests.
- **Palaces we hold dates at**: City Palace, Umaid Bhawan, Taj Lake Palace, Amer Fort, and ten more.
- **Family quote.**
- **Three sizes, priced plainly**: Intimate / Grand / Royal with guests, days, fee from, typical total.
- **Brief card** (preset to a royal wedding).

### Exhibitions (`exhibitions.html`)

- **Hero.** *Halls planned to the stall.* Trade shows, consumer fairs and art fairs, for organisers and exhibitors alike. Visual: a live hall plan.
- **Running the show, or taking a stand** (switch: for organisers / for exhibitors).
- **Ninety days to opening** (T−90 to T−0 timeline).
- **Opening day, India Art Fair-style hall** (photo showcase).
- **Three ways to take a stand**: shell scheme, custom build, pavilion, each with size, lead time and price from.
- **Brief card** (preset to an exhibition).

### Corporate events (`corporate-events.html`)

- **Hero.** *Twelve hundred delegates, seated by ten.* Conferences, launches, award nights and offsites, run to a minute-by-minute show sheet. Visual: the delegate badge on a lanyard.
- **Photo**: the dealer summit audience.
- **Six formats we run every year** (bento).
- **A day, minute by minute** (show sheet with live cue marker).
- **What we bring into the room** (stage and LED, sound and light, registration, interpretation, broadcast, group travel).
- **Client quote.**
- **Brief card** (preset to a corporate event).

## 5. Placeholder data (replace before launch)

Every figure, event name, family and client name, quote, price, capacity, address, phone number (+91 141 655 0190) and email (hello@vijayapna.in) is invented for the mock-up, as requested. Real venues are named as places only; the events "held" there are fictional. Publishing invented results or quotes on the live site would mislead your clients, so swap these for real ones first.

Local venues added in round 2 (Narula Convention Centre and Royal Cliff in Kanpur; Indira Gandhi Pratishthan and The Centrum in Lucknow) are real places used as examples. Confirm each with the venue before launch, and change any you do not work with.

The photo credits sit behind a "Photo credits" toggle in the footer. Keep that toggle while any Wikimedia Commons photo is on the page: their licences require the credit. The build lists only the Commons photos still in src/, so the list shrinks as your own photos replace them.

## 6. Photographs

Real photographs from Wikimedia Commons (CC BY / CC BY-SA / CC0), hot-linked at standard sizes and credited in every footer: Udaipur City Palace, Umaid Bhawan Palace, Taj Lake Palace, Amer Fort, mehndi, kanyadaan, dhol players, diyas and rangoli, lotus-bud décor, India Art Fair, India International Trade Fair, conference audiences and stands. Each sits in a swappable slot so your own event photos can replace them.

## 7. Recheck (before building)

- No section background alternation: all sections share `--color-paper`; only card stock and photos change tone. ✔
- Headlines ≤ 7 words, section heads ≤ 6, hero sentence ≤ 12 words. ✔
- No em or en dashes, no "Learn more / Get started", no buzzwords (seamless, elevate, unlock, world-class…). ✔
- No small tracked-capital labels above headings ("eyebrows"). ✔
- Every animation: transform/opacity only, reduced-motion fallback, content visible without script. ✔
- Every page: one primary button style, one container width, focus rings, skip link, meta description. ✔
- The brief form never pretends to send: it opens the visitor's email app. ✔
- Humanizer pass: triad headlines ("Six ceremonies. Four days. One palace.", "Twelve hundred people, one room, on time.") rewritten; no "showcase / vibrant / nestled / stunning / testament"; voice lines added ("We move ceremonies around your muhurat, not the other way round." / "Most shows are won or lost on the hall plan." / "If the keynote is at 10:00, the doors close at 09:55."). ✔
