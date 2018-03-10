#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';

import Util from './util';

import { IPromptResults } from './interfaces/prompts';

(async () => {
	// Default options
	let username = 'BrunoScheufler';

	// Basic prompt
	const promptResults: IPromptResults = await inquirer.prompt([
		{
			type: 'input',
			name: 'username',
			message: chalk.blue('Enter the GitHub username you want to spy on'),
			default: username
		},
		{
			type: 'list',
			name: 'timeSpan',
			message: chalk.blue('Choose time span you want to check for contributions'),
			choices: ['Last Day', 'Last Week', 'Last 30 Days', 'Last Year'],
			default: 0
		}
	]);

	username = promptResults.username ? promptResults.username : username;

	// Retrieve contributions using Puppeteer
	const contributions = await Util.retrieveContributions(username);

	// Calculate and print contributions
	let contributionCount = 0;
	let label = 'last day';

	// Time span prompt results
	switch (promptResults.timeSpan) {
		case 'Last Day':
			contributionCount = Util.countContributions(contributions, 1);
			label = 'last 24 hours';
			break;
		case 'Last Week':
			contributionCount = Util.countContributions(contributions, 7);
			label = 'last week';
			break;
		case 'Last 30 Days':
			contributionCount = Util.countContributions(contributions, 30);
			label = 'last month';
			break;
		case 'Last Year':
			contributionCount = Util.countContributions(contributions, 365);
			label = 'last year';
			break;
		default:
			break;
	}

	console.log(chalk.bold(chalk.green(`🕵️  ${username} contributed ${contributionCount} awesome things in the ${label}!`)));
})();
