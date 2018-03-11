import os from 'os';

import puppeteer from 'puppeteer';

import { IContribution } from '../interfaces/contributions';

export default class Util {
	public static countContributions(contributions: IContribution[], days: number) {
		let count = 0;

		for (let i = contributions.length - 1; i > contributions.length - 1 - days; i--) {
			count = count + contributions[i].count;
		}

		return count;
	}

	public static async retrieveContributions(username: string) {

		// Prepare Puppeteer
		const browser = await puppeteer.launch({ args: os.platform() !== 'win32' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] });
		const page = await browser.newPage();

		// Head over to GitHub
		const response = await page.goto(`https://github.com/${username}`);

		// Handle request errors
		if (response === null || !response.ok()) {
			throw new Error(`Request failed with status code: ${response !== null ? response.status() : null}`);
		}

		const contributions: IContribution[] = [];

		// Select contributions from GitHub
		const rawContributions = await page.evaluate(() => {
			const pathToAllContributions = '.js-calendar-graph > svg > g > g > rect';

			const data: any[] = [];

			const totalDays = document.querySelectorAll(pathToAllContributions);

			// Loop through all days and return serialized dataset properties containing contribution count
			// Dataset has to be serialized because nothing browser-related can be returned
			totalDays.forEach((day: any) => data.push(JSON.stringify(day.dataset)));

			return data;
		});

		// Shut down Puppeteer
		await page.close();
		await browser.close();

		// Normalize/Deserialize raw contributions
		rawContributions.forEach((value: any) => {
			value = JSON.parse(value);
			contributions.push({ count: parseInt(value.count, 10), date: value.date });
		});

		return contributions;
	}
}
