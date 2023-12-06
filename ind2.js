require("dotenv").config();
const { Telegraf, Scenes, Markup, Composer, session } = require("telegraf");
const axios = require("axios");


const bot = new Telegraf(process.env.BOT_TOKEN);

// Используем сессии для хранения состояния пользователя
bot.use(session());

// Обработчик команды /start
bot.start((ctx) => {
  const hasBranchParameter = ctx.startPayload && ctx.startPayload.includes('branch=');

  if (hasBranchParameter) {
    const selectedBranch = ctx.startPayload.split('=')[1];
    ctx.session.selectedBranch = selectedBranch;
    ctx.reply(`Вы уже указали филиал: ${selectedBranch}. Теперь отправьте команду /feedback, чтобы начать процесс обратной связи.`);
  } else {
    ctx.reply('Привет! Я бот для жалоб. Отправьте команду /feedback, чтобы начать процесс обратной связи.');
  }
});

// Обработчик команды /feedback
bot.command('feedback', (ctx) => {
  if (!ctx.session.selectedBranch) {
    ctx.reply('Отправьте сначала команду /start и выберите филиал.');
  } else {
    ctx.session.isFeedbackMode = true;
    ctx.reply('Вы в режиме обратной связи. Теперь отправьте вашу жалобу.');
  }
});

// Обработчик inline-кнопок выбора филиала
bot.action(/select_branch_[A-Za-z0-9]+/, (ctx) => {
  if (ctx.session.isSelectingBranch) {
    const selectedBranch = ctx.match[0].split('_')[2];
    ctx.session.selectedBranch = selectedBranch;
    ctx.reply(`Филиал ${selectedBranch} выбран. Теперь отправьте команду /feedback, чтобы начать процесс обратной связи.`);
    ctx.session.isSelectingBranch = false;
  }
});

// Обработчик команды /finish
bot.command('finish', (ctx) => {
  if (!ctx.session.selectedBranch) {
    ctx.session.isSelectingBranch = true;
    ctx.reply('Для завершения процесса обратной связи выберите ваш филиал:', {
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton('Shtab', 'select_branch_Shtab'),
        Markup.callbackButton('Dastarhan', 'select_branch_Dastarhan'),
        Markup.callbackButton('C-1', 'select_branch_C-1'),
        Markup.callbackButton('Darvaza', 'select_branch_Darvaza'),
        Markup.callbackButton('Muqimiy', 'select_branch_Muqimiy'),
        Markup.callbackButton('Yunusabad', 'select_branch_Yunusabad'),
        Markup.callbackButton('Almazar', 'select_branch_Almazar'),
        Markup.callbackButton('Next', 'select_branch_Next'),
        Markup.callbackButton('Shahrihan', 'select_branch_Shahrihan'),
        Markup.callbackButton('Qarasu', 'select_branch_Qarasu'),
        Markup.callbackButton('Samarkand', 'select_branch_Samarkand'),
      ]),
    });
  } else {
    ctx.reply('Вы уже в режиме обратной связи. Отправьте вашу жалобу.');
  }
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  const { isFeedbackMode } = ctx.session;

  if (isFeedbackMode) {
    const complaintText = ctx.message.text;
    // Ваш код для обработки и сохранения жалобы, например, в базу данных
    console.log(`Жалоба от пользователя ${ctx.from.id} (Филиал ${ctx.session.selectedBranch}): ${complaintText}`);
    ctx.reply('Жалоба получена. Спасибо за обращение!');
    // Завершаем режим обратной связи
    ctx.session.isFeedbackMode = false;
    // Очищаем выбранный филиал
    ctx.session.selectedBranch = null;
  } else {
    // Пользователь не в режиме обратной связи, предлагаем использовать команду /feedback
    ctx.reply('Отправьте сначала команду /feedback, затем вашу жалобу.');
  }
});

// Запуск бота
bot.launch();





// startWizard = new Composer();
// startWizard.on("text", async (ctx) => {
//   ctx.wizard.state.data = {};
//   if (ctx.message.text.includes(" ")) {
//     const [, branch] = ctx.message.text.split(" ");
//     ctx.wizard.state.data.branch = branch;
//   }
//   await ctx.reply("Assalomu aleykum. Ismingizni kiriting:");
//   return ctx.wizard.next();
// });

// firstName = new Composer();
// firstName.on("text", async (ctx) => {
//   console.log(ctx.wizard.state.data.username);
//   ctx.wizard.state.data.username = ctx.message.text;
//   await ctx.reply("Telefon raqamingizni yuboring:", {
//     ...Markup.keyboard([Markup.button.contactRequest("Send Contact")]).resize(),
//   });
//   return ctx.wizard.next();
// });

// phone = new Composer();
// phone.on("contact", async (ctx) => {
//   const sentContact = ctx.message.contact;
//   if (sentContact.user_id === ctx.from.id) {
//     ctx.wizard.state.data.phone = sentContact.phone_number;

//     // Continue with the wizard or perform other actions
//     // await ctx.reply(`Phone number received: ${ctx.wizard.state.data.phone}`);
//     // return ctx.wizard.next();

//     ctx.wizard.state.data.phone = sentContact.phone_number;
//     await ctx.reply("O'z fikringizni yozib qoldiring:", {
//       reply_markup: { remove_keyboard: true },
//     });
//     return ctx.wizard.next();
//   } else {
//     await ctx.reply("Faqat o'z kontaktingizni yuborishingizni so'raymiz!");
//   }
// });

// feedback = new Composer();
// feedback.on("text", async (ctx) => {
//   ctx.wizard.state.data.feedback = ctx.message.text;
//   // Rating keyboard
//   const ratingKeyboard = Markup.inlineKeyboard([
//     Markup.button.callback("1", "1"),
//     Markup.button.callback("2", "2"),
//     Markup.button.callback("3", "3"),
//     Markup.button.callback("4", "4"),
//     Markup.button.callback("5", "5"),
//   ]);
//   await ctx.reply("Iltimos, baholang:", ratingKeyboard);
//   return ctx.wizard.next();
// });

// const rating = new Composer();
// rating.on("callback_query", async (ctx) => {
//   ctx.wizard.state.data.rating = ctx.callbackQuery.data;

//   if (ctx.wizard.state.data.branch === undefined) {
//     const branchs = Markup.inlineKeyboard([
//       Markup.button.callback("Shtab", "Shtab"),
//       Markup.button.callback("Dastarhan", "Dastarhan"),
//       Markup.button.callback("S-1", "S-1"),
//       Markup.button.callback("Darvaza", "Darvaza"),
//       Markup.button.callback("Muqimiy", "Muqimiy"),
//     ]);
//     await ctx.editMessageText("Iltimos, filialni tanlang:", branchs);
//     return ctx.wizard.next();
//   } else {
//     // console.log(ctx.callbackQuery.data)
//     // await ctx.editMessageText(`Your feedback:\n
//     // name: ${ctx.wizard.state.data.username}
//     // phone number: ${ctx.wizard.state.data.phone}
//     // feedback text: ${ctx.wizard.state.data.feedback}
//     // rating: ${ctx.wizard.state.data.rating}
//     // branch: ${ctx.wizard.state.data.branch}`);
//     console.log(ctx.wizard.state.data);
//     axios
//       .post("https://sheetdb.io/api/v1/3ygrzu0j67o0m", ctx.wizard.state.data)
//       .then((response) => {
//         console.log("Data sent successfully:", response.data);
//       })
//       .catch((error) => {
//         console.error(
//           "Error sending data to SheetDB:",
//           error.response ? error.response.data : error.message
//         );
//       });
//     return ctx.scene.leave();
//   }
// });

// const selectBranch = new Composer();
// selectBranch.on("callback_query", async (ctx) => {
//   ctx.wizard.state.data.branch = ctx.callbackQuery.data;
// //   await bot.telegram.sendMessage(
// //     5939796099,
// //     `Your feedback:\n
// // name: ${ctx.wizard.state.data.username}
// // phone number: ${ctx.wizard.state.data.phone}
// // feedback text: ${ctx.wizard.state.data.feedback}
// // rating: ${ctx.wizard.state.data.rating}
// // branch: ${ctx.wizard.state.data.branch}`
// //   );
//   console.log(ctx.chat.id);

//     console.log(ctx.wizard.state.data);
//   axios
//     .post("https://sheetdb.io/api/v1/3ygrzu0j67o0m", ctx.wizard.state.data)
//     .then((response) => {
//       console.log("Data sent successfully:", response.data);
//     })
//     .catch((error) => {
//       console.error(
//         "Error sending data to SheetDB:",
//         error.response ? error.response.data : error.message
//       );
//     });
//   await ctx.reply("Otziviz yuborildi!");
//   return ctx.scene.leave();
// });

// const feedbackScene = new Scenes.WizardScene(
//   "sceneWizard",
//   startWizard,
//   firstName,
//   phone,
//   feedback,
//   rating,
//   selectBranch
// );

// const stage = new Scenes.Stage([feedbackScene]);
// bot.use(session());
// bot.use(stage.middleware());

// bot.start((ctx) => {
//   ctx.reply('Fikr qoldirishni boshlash uchun /feedback 👈ni bosing')
// });

// bot.command("feedback", (ctx) => {
//   const messageText = ctx.message.text;

//   if (messageText.includes(" ")) {
//     const [, branch] = messageText.split(" ");
//     // ctx.reply(`Вы нажали кнопку "Старт" с параметрами: ${params}`);
//     ctx.scene.enter("sceneWizard");
//   } else {
//     // ctx.reply('Вы нажали кнопку "Старт" без параметров');
//     ctx.scene.enter("sceneWizard");
//   }
// });

// bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
