import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../../structures/BaseCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import axios from 'axios';

class WeatherCommand extends BaseCommand {
    constructor() {
        super({
            name: 'weather',
            description: 'Get weather information for a city',
            category: 'utility',
            cooldown: 10000
        });
    }

    async execute(interaction, client) {
        const city = interaction.options.getString('city');

        await interaction.deferReply();

        if (!process.env.WEATHER_API_KEY) {
            return await interaction.editReply({
                embeds: [CuteEmbedBuilder.error(
                    'Weather API Unavailable',
                    'Weather service is not configured! 🥺\n\nThe bot admin needs to add a WEATHER_API_KEY to enable this feature.\n\n**How to get an API key:**\n1. Visit openweathermap.org\n2. Create a free account\n3. Get your API key\n4. Add it to the bot configuration'
                )]
            });
        }

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: city,
                    appid: process.env.WEATHER_API_KEY,
                    units: 'metric'
                }
            });

            const weather = response.data;
            const temp = Math.round(weather.main.temp);
            const feelsLike = Math.round(weather.main.feels_like);
            
            const weatherEmojis = {
                'clear sky': '☀️',
                'few clouds': '🌤️',
                'scattered clouds': '⛅',
                'broken clouds': '☁️',
                'shower rain': '🌦️',
                'rain': '🌧️',
                'thunderstorm': '⛈️',
                'snow': '❄️',
                'mist': '🌫️'
            };

            const weatherEmoji = weatherEmojis[weather.weather[0].description] || '🌤️';

            const weatherEmbed = CuteEmbedBuilder.info(
                `${weatherEmoji} Weather in ${weather.name}`,
                `**${weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}**`
            );

            weatherEmbed.addFields([
                { name: '🌡️ Temperature', value: `${temp}°C`, inline: true },
                { name: '🤗 Feels Like', value: `${feelsLike}°C`, inline: true },
                { name: '💧 Humidity', value: `${weather.main.humidity}%`, inline: true },
                { name: '💨 Wind Speed', value: `${weather.wind.speed} m/s`, inline: true },
                { name: '👁️ Visibility', value: `${weather.visibility / 1000} km`, inline: true },
                { name: '📊 Pressure', value: `${weather.main.pressure} hPa`, inline: true }
            ]);

            await interaction.editReply({ embeds: [weatherEmbed] });

        } catch (error) {
            let errorMsg = 'Failed to get weather data! 💔';
            
            if (!process.env.WEATHER_API_KEY) {
                errorMsg = 'Weather API key not configured! 🥺\nPlease ask an admin to add WEATHER_API_KEY to the bot configuration.';
            } else if (error.response?.status === 404) {
                errorMsg = 'City not found! Please check the spelling 🥺';
            } else if (error.response?.status === 401) {
                errorMsg = 'Invalid weather API key 😅';
            }

            await interaction.editReply({
                embeds: [CuteEmbedBuilder.error('Weather Error', errorMsg)]
            });
        }
    }

    toJSON() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('city')
                    .setDescription('City name to get weather for')
                    .setRequired(true)
                    .setMaxLength(100))
            .toJSON();
    }
}

export default new WeatherCommand();