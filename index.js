require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

bot.start((ctx) => {
  ctx.session = ctx.session || {};

  const startCommand = ctx.message.text;
  const parameters = startCommand.split(" ");

  if (parameters.length > 1) {
    const command = parameters[0];
    const branch = parameters.slice(1);
    ctx.session.branch = branch;
  } else {
    ctx.session.branch = null;
  }
  ctx.session.isFeedbackMode = false;
  console.log(ctx.session);
  ctx.reply(
    "Assalomu aleykum, Apexpizza oilasining rivoji uchun taklif hamda shikoyatlaringizni qoldirishingiz mumkin. Buning uchun: \n /feedback 👈 buyrug’ini kiriting"
  );
});

bot.command("feedback", (ctx) => {
  if (ctx.session === undefined) {
    return ctx.reply("Iltimos, oldin /start buyrug'ini bering!");
  }
  ctx.session.isFeedbackMode = true;
  ctx.reply("O’z shikoyat yoki takliflaringizni yozib qoldiring ☺️ !");
  ctx.session.complaint = {
    chatId: ctx.chat.id,
    messages: [],
  };
  console.log(ctx.session);
});

bot.command("finish", (ctx) => {
  if (ctx.session === undefined || ctx.session.complaint === undefined) {
    return ctx.reply("Iltimos, oldin /start buyrug'ini bering!");
  }
  console.log(ctx.session);
  if (ctx.session.branch === null) {
    const branchs = Markup.inlineKeyboard([
      Markup.button.callback("Shtab", "Shtab"),
      Markup.button.callback("Dastarhan", "Dastarhan"),
      Markup.button.callback("S-1", "S1"),
      Markup.button.callback("Darvaza", "Darvaza"),
      Markup.button.callback("Muqimiy", "Muqimiy"),
      Markup.button.callback("Yunusobod", "Yunusabad"),
    ]);
    ctx.reply("Iltimos, filialni tanlang:", branchs);
  } else {
    try {
      bot.telegram.sendMessage(
        -1002065453093,
        `🔔 <b>Мурожаат:</b>\n
  <b>📩Хабар:</b> ${ctx.session.complaint.messages}
  <b>⛪️Филиал:</b> ${ctx.session.branch}`, 
        { parse_mode: 'HTML' }
      );
      ctx.reply("Murojatingiz yuborildi, rahmat ❤️");
    } catch (err) {
      return ctx.reply("Iltimos, oldin /start buyrug'ini bering!");      
    }
  }});

  bot.on("callback_query", async (ctx) => {
    ctx.session.branch = ctx.callbackQuery.data;
    // userId: ${ctx.session.complaint.chatId}
      await bot.telegram.sendMessage(
      -1002065453093,
      `🔔 <b>Мурожаат:</b>\n
<b>📩Хабар:</b> ${ctx.session.complaint.messages}
<b>⛪️Филиал:</b> ${ctx.session.branch}`, 
      { parse_mode: 'HTML' }
    );
    ctx.session = {};
    ctx.editMessageText("Murojatingiz yuborildi, rahmat ❤️");
  });

bot.on("text", (ctx) => {
  if (ctx.session === undefined) {
    return ctx.reply("Iltimos, oldin /start buyrug'ini bering!");
  }
  const isFeedbackMode = ctx.session.isFeedbackMode;
  try {
    if (isFeedbackMode) {
      const complaintText = ctx.message.text;
      ctx.session.complaint.messages.push(complaintText);
      ctx.reply(
        "Xabaringiz qabul qilindi. Yana davom eting. \nYoki murojaatingizni yuborish uchun /finish buyrug'ini kiriting!"
      );
      console.log(ctx.session);
    } else {
      ctx.reply(
        "Iltimos, murojaatingizni qabul qilishim uchun \n /feedback buyrug'ini yuboring."
      );
    }
  } catch (err) {
    ctx.reply(
      "Iltimos, murojaatingizni qabul qilishim uchun \n /feedback buyrug'ini yuboring."
    );
  }
});

// bot.launch().then(console.log("Bot is here!"));
