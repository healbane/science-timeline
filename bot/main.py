import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

# Загрузка переменных окружения из файла .env
load_dotenv()

# Получение токена
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("Токен не найден. Проверь файл .env")

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # Создание клавиатуры с WebApp
    markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть ленту открытий 🚀",
                    web_app=WebAppInfo(url="https://healbane.github.io/science-timeline/")
                )
            ]
        ]
    )

    await message.answer(
        "Интерактивная лента открытий в науке и технике России.\nНажми на кнопку ниже, чтобы запустить:",
        reply_markup=markup
    )


async def main():
    logging.basicConfig(level=logging.INFO)
    # Удаление вебхука на случай, если он был установлен, и запуск поллинга
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())