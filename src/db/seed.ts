import "dotenv/config";
import { db, pool } from "./index";
import {
  categories,
  emailTemplates,
  faqs,
  galleries,
  languages,
  menuItems,
  menus,
  posts,
  settings,
  tables,
  translations,
  users,
  waiters,
} from "./schema";
import { DEFAULT_SETTINGS } from "../lib/settings";
import { slugify } from "../lib/utils";

type Seed = { cat: string; group: string; items: [string, number, string?][] };

const DATA: Seed[] = [
  {
    cat: "Coffee",
    group: "drinks",
    items: [
      ["Espresso", 1500, "Double shot of our house Rwandan bourbon roast."],
      ["Americano", 2000, "Espresso lengthened with hot water."],
      ["Cappuccino", 2500, "Espresso, steamed milk and a velvet foam cap."],
      ["Café Latte", 2800, "Silky milk poured over a smooth double shot."],
      ["Flat White", 3000, "Strong, small and creamy."],
      ["Mocha", 3500, "Chocolate, espresso and steamed milk."],
      ["Sinza Signature Coffee", 4000, "Our barista's seasonal single-origin pour over."],
    ],
  },
  {
    cat: "Tea",
    group: "drinks",
    items: [
      ["Rwandan Black Tea", 1500],
      ["African Tea (Milk Tea)", 2000],
      ["Ginger Lemon Tea", 2000],
      ["Green Tea", 1800],
      ["Masala Chai", 2500],
    ],
  },
  {
    cat: "Iced Drinks & Frappes",
    group: "drinks",
    items: [
      ["Iced Latte", 3500],
      ["Iced Americano", 3000],
      ["Caramel Frappe", 4500],
      ["Mocha Frappe", 4500],
      ["Affogato", 4000],
    ],
  },
  {
    cat: "Fresh Juice",
    group: "drinks",
    items: [
      ["Passion Juice", 2500],
      ["Tree Tomato Juice", 2500],
      ["Pineapple Juice", 2500],
      ["Watermelon Juice", 2500],
      ["Mixed Fruit Juice", 3000],
    ],
  },
  { cat: "Shakes", group: "drinks", items: [["Vanilla Milkshake", 4000], ["Chocolate Milkshake", 4000], ["Strawberry Milkshake", 4000], ["Oreo Shake", 4500]] },
  { cat: "Smoothies", group: "drinks", items: [["Banana Smoothie", 3500], ["Avocado Smoothie", 4000], ["Berry Smoothie", 4000], ["Green Detox Smoothie", 4500]] },
  {
    cat: "Soft Drinks",
    group: "drinks",
    items: [
      ["Water (Small)", 1000],
      ["Water (Large)", 2000],
      ["Coca-Cola", 1500],
      ["Fanta", 1500],
      ["Sprite", 1500],
      ["Novida", 2000],
      ["Tonic Water", 2000],
    ],
  },
  { cat: "Local Beers", group: "bar", items: [["Primus", 2000], ["Mützig", 2500], ["Skol Lager", 2500], ["Turbo King", 2500], ["Heineken", 3500]] },
  {
    cat: "Rolex",
    group: "food",
    items: [
      ["Classic Rolex", 3000, "Chapati rolled around a fresh vegetable omelette."],
      ["King Size Rolex", 4500, "Extra egg + toppings (+1,500)."],
      ["Cheese Rolex", 4000],
      ["Beef Rolex", 5000],
    ],
  },
  { cat: "Wraps", group: "food", items: [["Chicken Wrap", 6500], ["Beef Wrap", 7000], ["Veggie Wrap", 5500], ["Falafel Wrap", 6000]] },
  { cat: "Burgers", group: "food", items: [["Sinza Beef Burger", 8000], ["Chicken Burger", 7500], ["Double Cheese Burger", 10000], ["Veggie Burger", 6500]] },
  { cat: "Sandwiches", group: "food", items: [["Club Sandwich", 7000], ["Grilled Cheese Sandwich", 5000], ["Tuna Sandwich", 6500], ["Chicken Avocado Sandwich", 7500]] },
  { cat: "Chicken", group: "food", items: [["Grilled Quarter Chicken", 7000], ["Half Chicken", 12000], ["BBQ Chicken Wings", 8500], ["Chicken Drumsticks", 7500]] },
  { cat: "Omelettes", group: "food", items: [["Plain Omelette", 2500], ["Spanish Omelette", 4000], ["Cheese & Mushroom Omelette", 4500]] },
  { cat: "Famous Chips", group: "food", items: [["Chips Plain", 2500], ["Masala Chips", 3500], ["Chips & Cheese", 4500], ["Chips Kuku", 7500]] },
  { cat: "Pasta", group: "food", items: [["Spaghetti Bolognese", 8000], ["Penne Arrabbiata", 7000], ["Creamy Chicken Pasta", 9000]] },
  { cat: "Fresh Salads", group: "food", items: [["Garden Salad", 4500], ["Greek Salad", 6000], ["Chicken Caesar Salad", 7500], ["Avocado Salad", 5500]] },
  { cat: "Breakfast", group: "food", items: [["Sinza Full Breakfast", 9000, "Eggs, sausage, toast, beans, fruit and coffee."], ["Pancakes & Honey", 4500], ["French Toast", 4500], ["Katogo", 4000]] },
  { cat: "Snacks", group: "food", items: [["Samosa (2 pcs)", 2000], ["Chapati", 1000], ["Sambusa Beef", 2500], ["Croissant", 2500], ["Carrot Cake Slice", 3500]] },
  { cat: "Other Sides (Add On)", group: "food", items: [["Extra Egg", 1500], ["Extra Cheese", 1500], ["Guacamole", 2000], ["Side Salad", 2000], ["Garlic Bread", 2500]] },
  { cat: "Whiskies & Spirits", group: "bar", items: [["Jameson (Shot)", 4000], ["Johnnie Walker Black", 6000], ["Jack Daniel's", 6000], ["Chivas Regal 12", 7000]] },
  { cat: "Tequila & Liquors", group: "bar", items: [["Jose Cuervo Silver", 5000], ["Amarula", 4000], ["Baileys", 4500], ["Jägermeister", 5000]] },
  { cat: "Champagnes & Sparkling", group: "bar", items: [["Moët & Chandon Brut", 120000], ["Prosecco Bottle", 45000], ["Sparkling Rosé", 38000]] },
  { cat: "Cognac", group: "bar", items: [["Hennessy VS (Shot)", 8000], ["Hennessy VSOP Bottle", 190000], ["Martell VS", 8500]] },
  { cat: "Gin & Vodka", group: "bar", items: [["Gordon's Gin", 4000], ["Bombay Sapphire", 6000], ["Absolut Vodka", 5000], ["Smirnoff", 4000]] },
  { cat: "White & Red Wine", group: "bar", items: [["House Red (Glass)", 5000], ["House White (Glass)", 5000], ["Nederburg Cabernet Bottle", 35000], ["Chenin Blanc Bottle", 32000]] },
  { cat: "Cocktail Drinks", group: "bar", items: [["Mojito", 7000], ["Espresso Martini", 9000], ["Dawa", 7500], ["Piña Colada", 8000], ["Sinza Sunset", 8500]] },
  { cat: "Mocktails", group: "bar", items: [["Virgin Mojito", 4500], ["Shirley Temple", 4500], ["Tropical Sunrise", 5000], ["Cucumber Cooler", 4500]] },
];

async function main() {
  console.log("Seeding Sinza Coffee Shop…");

  await db
    .insert(settings)
    .values({ key: "site", value: DEFAULT_SETTINGS })
    .onConflictDoNothing();

  const existingMenus = await db.select().from(menus);
  let mainMenuId: number;
  if (existingMenus.length) {
    mainMenuId = existingMenus[0].id;
  } else {
    const inserted = await db
      .insert(menus)
      .values([
        { name: "All Day Menu", slug: "all-day", description: "Served 07:00 – 23:00", position: 0 },
        { name: "Breakfast Menu", slug: "breakfast", description: "Served 07:00 – 11:30", position: 1 },
        { name: "Bar & Cocktails", slug: "bar", description: "From 16:00", position: 2 },
      ])
      .returning();
    mainMenuId = inserted[0].id;
  }

  const existingCats = await db.select().from(categories);
  if (!existingCats.length) {
    for (let i = 0; i < DATA.length; i += 1) {
      const block = DATA[i];
      const [cat] = await db
        .insert(categories)
        .values({
          menuId: mainMenuId,
          name: block.cat,
          slug: slugify(block.cat),
          group: block.group,
          position: i,
        })
        .returning();

      await db.insert(menuItems).values(
        block.items.map(([name, price, description], idx) => ({
          categoryId: cat.id,
          name,
          slug: slugify(`${name}`),
          price,
          description: description ?? `${name} freshly prepared at Sinza Coffee Shop.`,
          longDescription:
            description ??
            `${name} — made to order by our team in Gisozi (Kwa Gakire). Ask your waiter for allergen information.`,
          position: idx,
          featured: idx === 0 && i % 4 === 0,
          options: name.toLowerCase().includes("king size")
            ? [{ name: "Extra egg + toppings", price: 1500 }]
            : [],
        })),
      );
    }
  }

  const existingWaiters = await db.select().from(waiters);
  if (!existingWaiters.length) {
    await db.insert(waiters).values([
      { name: "Aline U.", shift: "morning" },
      { name: "Eric N.", shift: "afternoon" },
      { name: "Sandrine K.", shift: "evening" },
      { name: "Patrick M.", shift: "all-day" },
      { name: "Diane I.", shift: "all-day" },
    ]);
  }

  const existingTables = await db.select().from(tables);
  if (!existingTables.length) {
    await db.insert(tables).values(
      Array.from({ length: 12 }, (_, i) => ({
        label: `Table ${i + 1}`,
        qrToken: `SINZA-TABLE-${String(i + 1).padStart(2, "0")}`,
      })),
    );
  }

  const existingFaqs = await db.select().from(faqs);
  if (!existingFaqs.length) {
    await db.insert(faqs).values([
      { question: "Where is Sinza Coffee Shop?", answer: "We are in Gisozi (Kwa Gakire), Kigali — Rwanda. Use the map on the contact page for directions.", position: 0 },
      { question: "Do I need an account to order?", answer: "No. An account is optional — it simply saves your orders and favourites. You can always order as a guest.", position: 1 },
      { question: "How can I pay?", answer: "MTN MoMo and Airtel Money through PawaPay, or a card through Pesapal. You may also pay cash after eating.", position: 2 },
      { question: "Can I choose my waiter?", answer: "Yes, scan the table QR code inside the restaurant and pick any available waiter or waitress.", position: 3 },
      { question: "Do you host events?", answer: "Yes — private events, coffee cuppings and live-music evenings. Contact us for bookings.", position: 4 },
    ]);
  }

  const existingPosts = await db.select().from(posts);
  if (!existingPosts.length) {
    await db.insert(posts).values([
      {
        title: "20% off every Rolex, all week",
        slug: "20-off-rolex-week",
        excerpt: "Our famous King Size Rolex now comes with a 20% discount from Monday to Friday.",
        body: "Come through for the King Size Rolex — extra egg and toppings included — with 20% off the whole week. Available for dine-in and takeaway orders placed through the website.",
        type: "offer",
        discount: "20%",
        link: "/menu?category=rolex",
        published: true,
      },
      {
        title: "How we roast our Rwandan bourbon beans",
        slug: "how-we-roast",
        excerpt: "A short story about the beans behind the Sinza signature cup.",
        body: "Our beans travel from the hills of Huye and Nyamasheke. We roast in small batches every week so that every cup at Gisozi tastes like it just left the drum.",
        type: "blog",
        published: true,
      },
      {
        title: "Live acoustic nights — every Friday",
        slug: "live-acoustic-nights",
        excerpt: "Music, cocktails and small plates from 19:00 every Friday.",
        body: "Join us every Friday evening for live acoustic sets from Kigali artists. Free entrance, reservations recommended.",
        type: "event",
        published: true,
      },
    ]);
  }

  const existingGallery = await db.select().from(galleries);
  if (!existingGallery.length) {
    await db.insert(galleries).values([
      { title: "The counter", description: "Our barista station at golden hour.", url: "/brand/gallery-1.jpg", type: "interior", position: 0 },
      { title: "Signature latte", description: "Rwandan bourbon beans, velvet milk.", url: "/brand/gallery-2.jpg", type: "drinks", position: 1 },
      { title: "Brunch table", description: "Sinza full breakfast for two.", url: "/brand/gallery-3.jpg", type: "food", position: 2 },
    ]);
  }

  const existingLangs = await db.select().from(languages);
  if (!existingLangs.length) {
    await db.insert(languages).values([
      { code: "en", label: "English" },
      { code: "fr", label: "Français" },
      { code: "rw", label: "Kinyarwanda" },
    ]);
    await db.insert(translations).values([
      { locale: "en", key: "nav.menu", value: "Menu" },
      { locale: "fr", key: "nav.menu", value: "Carte" },
      { locale: "rw", key: "nav.menu", value: "Ibiribwa" },
      { locale: "en", key: "cta.order", value: "Order now" },
      { locale: "fr", key: "cta.order", value: "Commander" },
      { locale: "rw", key: "cta.order", value: "Tumiza nonaha" },
      { locale: "en", key: "nav.reservation", value: "Reservation" },
      { locale: "fr", key: "nav.reservation", value: "Réservation" },
      { locale: "rw", key: "nav.reservation", value: "Kubika ameza" },
    ]);
  }

  const existingTemplates = await db.select().from(emailTemplates);
  if (!existingTemplates.length) {
    await db.insert(emailTemplates).values([
      {
        name: "Weekly menu newsletter",
        subject: "This week at Sinza Coffee Shop ☕",
        category: "newsletter",
        html: `<h2>This week at Sinza</h2><table width="100%" cellpadding="8" style="border-collapse:collapse"><tr style="background:#F7F0EB"><th align="left">Item</th><th align="right">Price</th></tr><tr><td>Sinza Signature Coffee</td><td align="right">4,000 RWF</td></tr><tr><td>King Size Rolex</td><td align="right">4,500 RWF</td></tr></table><p>See you in Gisozi (Kwa Gakire)!</p>`,
      },
      {
        name: "Order receipt",
        subject: "Your Sinza order {{code}}",
        category: "transactional",
        html: `<p>Hi {{name}},</p><p>Thank you for your order <strong>{{code}}</strong>. Total: <strong>{{total}}</strong>.</p><p>You can pay now or after eating using the link below.</p>`,
      },
      {
        name: "Special offer announcement",
        subject: "{{discount}} off at Sinza Coffee Shop",
        category: "marketing",
        html: `<h2>{{title}}</h2><p>{{message}}</p><p><a href="{{link}}">Grab the offer</a></p>`,
      },
    ]);
  }

  const adminEmail = (process.env.ADMIN_EMAILS || "admin@sinzacoffee.rw").split(",")[0].trim();
  const existingUsers = await db.select().from(users);
  if (!existingUsers.length) {
    await db
      .insert(users)
      .values({ email: adminEmail.toLowerCase(), name: "Sinza Admin", role: "admin", activated: true })
      .onConflictDoNothing();
  }

  console.log("Seed complete ✔");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
